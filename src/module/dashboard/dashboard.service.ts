import { prisma } from "../../lib/prisma.js";
import ApiError from "../../utils/ApiError.js";
import { dateKey, startOfIsoWeek, toUtcDateOnly } from "../../utils/date.js";
import { Role, AttendanceStatus } from "@prisma/client";

interface SessionOverview {
    id: number;
    name: string;
    type: string;
    startTime: Date;
    endTime: Date;
    groupId: number;
    groupName: string;
    courseId: number;
    courseName: string;
    rosterCount: number;
    markedCount: number;
}

class DashboardService {
    async getSummary(groupId?: number) {
        try {
            const today = new Date();
            const todayKey = dateKey(today);
            const todayStart = new Date(todayKey + "T00:00:00Z");
            const tomorrowStart = new Date(todayStart);
            tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

            const weekStart = startOfIsoWeek(today);
            const weekEnd = new Date(weekStart);
            weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

            const groupWhere = groupId ? { groupId } : {};

            const [
                trainees,
                trainers,
                groups,
                courses,
                sessions,
                todaySessions,
                weekSessions,
            ] = await Promise.all([
                prisma.trainee.count({ where: groupId ? { groupId } : {} }),
                prisma.user.count({
                    where: { role: Role.TRAINER, ...(groupId ? { groupId } : {}) },
                }),
                groupId
                    ? prisma.group.count({ where: { id: groupId } })
                    : prisma.group.count(),
                groupId
                    ? prisma.groupCourse.count({ where: { groupId } })
                    : prisma.course.count(),
                prisma.session.count({
                    where: { groupCourse: groupWhere },
                }),
                prisma.session.findMany({
                    where: {
                        groupCourse: groupWhere,
                        startTime: { gte: todayStart, lt: tomorrowStart },
                    },
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        startTime: true,
                        endTime: true,
                        groupCourse: {
                            select: {
                                group: { select: { id: true, name: true } },
                                course: { select: { id: true, name: true } },
                            },
                        },
                    },
                    orderBy: { startTime: "asc" },
                }),
                prisma.session.count({
                    where: {
                        groupCourse: groupWhere,
                        startTime: { gte: weekStart, lt: weekEnd },
                    },
                }),
            ]);

            const sessionOverviews: SessionOverview[] = [];
            for (const s of todaySessions) {
                const [rosterCount, markedCount] = await Promise.all([
                    prisma.trainee
                        .count({ where: await this.rosterWhere(s.groupCourse.group.id, s.startTime) })
                        .catch(() => 0),
                    prisma.traineeAttendance.count({ where: { sessionId: s.id } }),
                ]);
                sessionOverviews.push({
                    id: s.id,
                    name: s.name,
                    type: s.type,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    groupId: s.groupCourse.group.id,
                    groupName: s.groupCourse.group.name,
                    courseId: s.groupCourse.course.id,
                    courseName: s.groupCourse.course.name,
                    rosterCount,
                    markedCount,
                });
            }

            const attendanceCounts = await prisma.traineeAttendance.groupBy({
                by: ["status"],
                where: { session: { groupCourse: groupWhere } },
                _count: { _all: true },
            });

            const totalRecords = attendanceCounts.reduce(
                (sum, g) => sum + g._count._all,
                0
            );
            const presentish = attendanceCounts
                .filter((g) => g.status === AttendanceStatus.PRESENT || g.status === AttendanceStatus.LATE)
                .reduce((sum, g) => sum + g._count._all, 0);
            const attendanceRate =
                totalRecords > 0 ? Math.round((presentish / totalRecords) * 100) : null;

            const weekAbsenceRecords = await prisma.traineeAttendance.findMany({
                where: {
                    status: AttendanceStatus.ABSENT,
                    session: {
                        groupCourse: groupWhere,
                        startTime: { gte: weekStart, lt: weekEnd },
                    },
                },
                select: {
                    trainee: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            studentId: true,
                            group: { select: { id: true, name: true } },
                        },
                    },
                },
            });

            const absenceMap = new Map<
                number,
                {
                    id: number;
                    name: string | null;
                    email: string;
                    studentId: string | null;
                    homeGroup: string | null;
                    absences: number;
                }
            >();

            for (const rec of weekAbsenceRecords) {
                const t = rec.trainee;
                let entry = absenceMap.get(t.id);
                if (!entry) {
                    entry = {
                        id: t.id,
                        name: t.name,
                        email: t.email,
                        studentId: t.studentId,
                        homeGroup: t.group?.name ?? null,
                        absences: 0,
                    };
                    absenceMap.set(t.id, entry);
                }
                entry.absences += 1;
            }

            const atRisk = Array.from(absenceMap.values())
                .filter((t) => t.absences >= 3)
                .sort((a, b) => b.absences - a.absences);

            let groupOverview: { id: number; name: string; trainees: number; sessions: number; rate: number | null }[] = [];

            if (!groupId) {
                const allGroups = await prisma.group.findMany({
                    select: { id: true, name: true, _count: { select: { trainees: true } } },
                });

                const groupSessions = await prisma.session.groupBy({
                    by: ["groupCourseId"],
                    _count: { _all: true },
                });

                const groupAttendances = await prisma.traineeAttendance.findMany({
                    select: {
                        status: true,
                        session: { select: { groupCourse: { select: { groupId: true } } } },
                    },
                });

                const sessionCountByGroup = new Map<number, number>();
                for (const g of groupSessions) {
                    const gc = await prisma.groupCourse.findUnique({
                        where: { id: g.groupCourseId },
                        select: { groupId: true },
                    });
                    if (gc) {
                        sessionCountByGroup.set(
                            gc.groupId,
                            (sessionCountByGroup.get(gc.groupId) ?? 0) + g._count._all
                        );
                    }
                }

                const countsByGroup = new Map<number, { present: number; total: number }>();
                for (const a of groupAttendances) {
                    const gid = a.session.groupCourse.groupId;
                    const entry = countsByGroup.get(gid) ?? { present: 0, total: 0 };
                    entry.total += 1;
                    if (a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE) {
                        entry.present += 1;
                    }
                    countsByGroup.set(gid, entry);
                }

                groupOverview = allGroups.map((g) => {
                    const counts = countsByGroup.get(g.id);
                    return {
                        id: g.id,
                        name: g.name,
                        trainees: g._count.trainees,
                        sessions: sessionCountByGroup.get(g.id) ?? 0,
                        rate: counts && counts.total > 0
                            ? Math.round((counts.present / counts.total) * 100)
                            : null,
                    };
                });
            }

            return {
                stats: {
                    trainees,
                    trainers,
                    groups,
                    courses,
                    sessions,
                    todaySessions: todaySessions.length,
                    weekSessions,
                    attendanceRate,
                },
                todaySessions: sessionOverviews,
                atRisk,
                groupOverview,
                weekStart: dateKey(weekStart),
                weekEnd: dateKey(weekEnd),
            };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to build dashboard summary");
        }
    }

    private async rosterWhere(groupId: number, date: Date) {
        const overrides = await prisma.groupOverride.findMany({
            where: { date: toUtcDateOnly(date) },
            select: { traineeId: true, groupId: true },
        });

        const overriddenTraineeIds = overrides.map((o) => o.traineeId);
        const movedInIds = overrides
            .filter((o) => o.groupId === groupId)
            .map((o) => o.traineeId);

        return {
            OR: [
                { groupId, id: { notIn: overriddenTraineeIds } },
                { id: { in: movedInIds } },
            ],
        };
    }
}

export default new DashboardService();