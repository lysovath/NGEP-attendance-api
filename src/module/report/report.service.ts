import { prisma } from "../../lib/prisma.js";
import ApiError from "../../utils/ApiError.js";
import { startOfIsoWeek, dateKey } from "../../utils/date.js";
import { AttendanceStatus } from "@prisma/client";

interface WeeklyCounts {
    PRESENT: number;
    ABSENT: number;
    LATE: number;
    EXCUSED: number;
    total: number;
}

interface PersonReport {
    id: number;
    name: string | null;
    email: string;
    studentId: string | null;
    byWeek: Record<string, WeeklyCounts>;
    totals: WeeklyCounts & { rate: number | null };
}

const emptyCounts = (): WeeklyCounts => ({ PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, total: 0 });

function addStatus(counts: WeeklyCounts, status: AttendanceStatus) {
    counts[status] += 1;
    counts.total += 1;
}

function rateOf(counts: WeeklyCounts): number | null {
    if (counts.total === 0) return null;
    return Math.round(((counts.PRESENT + counts.LATE) / counts.total) * 100);
}

class ReportService {
    async getWeeklyReport(groupId?: number, courseId?: number) {
        try {
            const sessions = await prisma.session.findMany({
                where: {
                    groupCourse: {
                        ...(groupId ? { groupId } : {}),
                        ...(courseId ? { courseId } : {}),
                    },
                },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    startTime: true,
                },
                orderBy: { startTime: "asc" },
            });

            const sessionWeek = new Map<number, string>();
            const weekMeta = new Map<string, { start: string; sessionCount: number }>();

            for (const s of sessions) {
                const key = dateKey(startOfIsoWeek(s.startTime));
                sessionWeek.set(s.id, key);
                const meta = weekMeta.get(key);
                if (meta) {
                    meta.sessionCount += 1;
                } else {
                    weekMeta.set(key, { start: key, sessionCount: 1 });
                }
            }

            const orderedWeekKeys = Array.from(weekMeta.keys()).sort();
            const weeks = orderedWeekKeys.map((key, index) => {
                const start = new Date(key + "T00:00:00Z");
                const end = new Date(start);
                end.setUTCDate(end.getUTCDate() + 6);
                return {
                    key,
                    label: `Week ${index + 1}`,
                    start: key,
                    end: dateKey(end),
                    sessionCount: weekMeta.get(key)!.sessionCount,
                };
            });

            const sessionIds = sessions.map((s) => s.id);

            const buildPersonMap = (
                records: {
                    status: AttendanceStatus;
                    sessionId: number;
                    person: { id: number; name: string | null; email: string; studentId: string | null };
                }[]
            ): PersonReport[] => {
                const people = new Map<number, PersonReport>();

                for (const rec of records) {
                    const weekKey = sessionWeek.get(rec.sessionId);
                    if (!weekKey) continue;

                    let person = people.get(rec.person.id);
                    if (!person) {
                        person = {
                            id: rec.person.id,
                            name: rec.person.name,
                            email: rec.person.email,
                            studentId: rec.person.studentId,
                            byWeek: {},
                            totals: { ...emptyCounts(), rate: null },
                        };
                        for (const wk of orderedWeekKeys) {
                            person.byWeek[wk] = emptyCounts();
                        }
                        people.set(rec.person.id, person);
                    }

                    const weekCounts = person.byWeek[weekKey] ?? emptyCounts();
                    person.byWeek[weekKey] = weekCounts;
                    addStatus(weekCounts, rec.status);
                    addStatus(person.totals, rec.status);
                }

                const list = Array.from(people.values());
                for (const p of list) {
                    p.totals.rate = rateOf(p.totals);
                }
                list.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
                return list;
            };

            let trainees: PersonReport[] = [];
            let trainers: PersonReport[] = [];

            if (sessionIds.length > 0) {
                const traineeRecords = await prisma.traineeAttendance.findMany({
                    where: { sessionId: { in: sessionIds } },
                    select: {
                        status: true,
                        sessionId: true,
                        trainee: { select: { id: true, name: true, email: true, studentId: true } },
                    },
                });

                const trainerRecords = await prisma.trainerAttendance.findMany({
                    where: { sessionId: { in: sessionIds } },
                    select: {
                        status: true,
                        sessionId: true,
                        trainer: { select: { id: true, name: true, email: true, studentId: true } },
                    },
                });

                trainees = buildPersonMap(
                    traineeRecords.map((r) => ({ status: r.status, sessionId: r.sessionId, person: r.trainee }))
                );
                trainers = buildPersonMap(
                    trainerRecords.map((r) => ({ status: r.status, sessionId: r.sessionId, person: r.trainer }))
                );
            }

            return {
                weeks,
                totalSessions: sessions.length,
                trainees,
                trainers,
            };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to build weekly report");
        }
    }
}

export default new ReportService();
