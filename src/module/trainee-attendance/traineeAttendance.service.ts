import { prisma } from "../../lib/prisma.js";
import ApiError from "../../utils/ApiError.js";
import { AttendanceStatus } from "@prisma/client";
import enrollmentService from "../enrollment/enrollment.service.js";

interface TraineeAttendanceData {
    traineeId: number;
    status: AttendanceStatus;
}

interface TraineeAttendanceImportRow {
    email: string;
    status: AttendanceStatus;
}

class TraineeAttendanceService {
    private async getSessionOrThrow(sessionId: number) {
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            select: { startTime: true, groupCourse: { select: { groupId: true } } },
        });

        if (!session || !session.groupCourse) {
            throw ApiError.notFound("Session not found");
        }
        return session;
    }

    async getTraineeAttendances(sessionId: number) {
        try {
            const session = await this.getSessionOrThrow(sessionId);

            const rosterWhere = await enrollmentService.buildRosterWhere(
                session.groupCourse.groupId,
                session.startTime
            );

            const traineeAttendances = await prisma.trainee.findMany({
                where: rosterWhere,
                orderBy: { name: "asc" },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    studentId: true,
                    traineeAttendances: {
                        where: { sessionId: sessionId },
                        select: {
                            status: true,
                            updatedAt: true,
                        },
                    },
                },
            });

            return {
                trainees: traineeAttendances.map((trainee) => ({
                    id: trainee.id,
                    email: trainee.email,
                    name: trainee.name,
                    studentId: trainee.studentId,
                    status: trainee.traineeAttendances[0]?.status ?? "UNMARKED",
                    markedAt: trainee.traineeAttendances[0]?.updatedAt ?? null,
                })),
            };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to retrieve trainee attendances");
        }
    }

    async batchCreateTraineeAttendance(sessionId: number, attendanceData: TraineeAttendanceData[]) {
        try {
            if (!attendanceData || attendanceData.length === 0) {
                throw ApiError.badRequest("Attendance data is empty");
            }

            const session = await this.getSessionOrThrow(sessionId);

            const deduped = new Map<number, AttendanceStatus>();
            for (const record of attendanceData) {
                deduped.set(record.traineeId, record.status);
            }
            const records = Array.from(deduped.entries()).map(([traineeId, status]) => ({
                traineeId,
                status,
            }));

            const rosterWhere = await enrollmentService.buildRosterWhere(
                session.groupCourse.groupId,
                session.startTime
            );
            const roster = await prisma.trainee.findMany({
                where: rosterWhere,
                select: { id: true },
            });
            const rosterIds = new Set(roster.map((t) => t.id));

            const invalidIds = records
                .map((r) => r.traineeId)
                .filter((id) => !rosterIds.has(id));

            if (invalidIds.length > 0) {
                throw ApiError.badRequest(
                    `Trainee(s) ${invalidIds.join(", ")} are not part of this session's roster`
                );
            }

            const createQuery = prisma.traineeAttendance.createMany({
                data: records.map((data) => ({
                    sessionId,
                    traineeId: data.traineeId,
                    status: data.status,
                })),
                skipDuplicates: true,
            });

            const statusGroups = records.reduce((acc, curr) => {
                if (!acc[curr.status]) {
                    acc[curr.status] = [];
                }
                acc[curr.status].push(curr.traineeId);
                return acc;
            }, {} as Record<AttendanceStatus, number[]>);

            const updateQueries = Object.entries(statusGroups).map(([status, traineeIds]) =>
                prisma.traineeAttendance.updateMany({
                    where: {
                        sessionId: sessionId,
                        traineeId: { in: traineeIds },
                    },
                    data: {
                        status: status as AttendanceStatus,
                    },
                })
            );

            await prisma.$transaction([createQuery, ...updateQueries]);

            return this.getTraineeAttendances(sessionId);
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to batch create trainee attendance");
        }
    }

    async importTraineeAttendance(sessionId: number, rows: TraineeAttendanceImportRow[]) {
        try {
            if (!rows || rows.length === 0) {
                throw ApiError.badRequest("No rows to import");
            }

            await this.getSessionOrThrow(sessionId);

            const emails = rows.map((r) => r.email.trim().toLowerCase());
            const trainees = await prisma.trainee.findMany({
                where: { email: { in: emails } },
                select: { id: true, email: true },
            });

            const emailToId = new Map<string, number>(
                trainees.map((t) => [t.email.toLowerCase(), t.id] as [string, number])
            );

            const matched: TraineeAttendanceData[] = [];
            const notFound: string[] = [];

            for (const row of rows) {
                const id = emailToId.get(row.email.trim().toLowerCase());
                if (id) {
                    matched.push({ traineeId: id, status: row.status });
                } else {
                    notFound.push(row.email);
                }
            }

            if (matched.length === 0) {
                throw ApiError.badRequest("No matching trainees found for the provided emails");
            }

            const result = await this.batchCreateTraineeAttendance(sessionId, matched);

            return {
                marked: matched.length,
                notFound,
                attendances: result,
            };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to import trainee attendance");
        }
    }
}

export default new TraineeAttendanceService();
