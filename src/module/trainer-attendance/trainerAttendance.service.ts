import {prisma} from "../../lib/prisma.js";
import ApiError from "../../utils/ApiError.js";
import { Role, AttendanceStatus } from "@prisma/client";

interface TrainerAttendanceData {
    trainerId: number;
    status: AttendanceStatus;
}

class TrainerAttendanceService {
    async createTrainerAttendance(sessionId: number, { trainerId, status }: TrainerAttendanceData) {
        try {
            const trainerAttendance = await prisma.trainerAttendance.create({
                data: {
                    trainerId: trainerId,
                    sessionId: sessionId,
                    status: status,
                },
                select: {
                    id: true,
                    trainerId: true,
                    sessionId: true,
                }
            });
            return trainerAttendance;
        } catch (error) {
            throw ApiError.internal("Failed to create trainer attendance");
        }
    }

    async batchCreateTrainerAttendance(sessionId: number, attendanceData: TrainerAttendanceData[]) {
        try {
            if (!attendanceData || attendanceData.length === 0) {
                return this.getTrainerAttendances(sessionId);
            }

            const session = await prisma.session.findUnique({
                where: { id: sessionId },
                select: { groupCourse: { select: { groupId: true } } }
            });

            if (!session || !session.groupCourse) {
                throw ApiError.notFound("Session not found");
            }

            const deduped = new Map<number, AttendanceStatus>();
            for (const record of attendanceData) {
                deduped.set(record.trainerId, record.status);
            }
            const records = Array.from(deduped.entries()).map(([trainerId, status]) => ({
                trainerId,
                status,
            }));

            const groupTrainers = await prisma.user.findMany({
                where: { role: Role.TRAINER, groupId: session.groupCourse.groupId },
                select: { id: true },
            });
            const trainerIds = new Set(groupTrainers.map((t) => t.id));

            const invalidIds = records
                .map((r) => r.trainerId)
                .filter((id) => !trainerIds.has(id));

            if (invalidIds.length > 0) {
                throw ApiError.badRequest(
                    `Trainer(s) ${invalidIds.join(", ")} are not part of this group`
                );
            }

            const createQuery = prisma.trainerAttendance.createMany({
                data: records.map((data) => ({
                    sessionId,
                    trainerId: data.trainerId,
                    status: data.status,
                })),
                skipDuplicates: true,
            });

            const statusGroups = records.reduce((acc, data) => {
                if (!acc[data.status]) {
                    acc[data.status] = [];
                }
                acc[data.status].push(data.trainerId);
                return acc;
            }, {} as Record<AttendanceStatus, number[]>);
        
            const updateQueries = Object.entries(statusGroups).map(([status, trainerIds]) =>
                prisma.trainerAttendance.updateMany({
                    where: {
                        sessionId: sessionId,
                        trainerId: { in: trainerIds },
                    },
                    data: {
                        status: status as AttendanceStatus,
                    },
                })
            );
        
            await prisma.$transaction([createQuery, ...updateQueries]);
        
            return this.getTrainerAttendances(sessionId);
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to batch create trainer attendance");
        }
    }

    async getTrainerAttendances(sessionId: number) {
        try {
            const session = await prisma.session.findUnique({
                where: { id: sessionId },
                select: { groupCourse: { select: { groupId: true } } }
            });

            if (!session || !session.groupCourse) {
                throw ApiError.notFound("Session not found");
            }

            const trainerAttendances = await prisma.user.findMany({
                where: {
                    role: Role.TRAINER,
                    groupId: session.groupCourse.groupId,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    studentId: true,
                    trainerAttendances: {
                        where: { sessionId: sessionId },
                        select: {
                            status: true,
                            updatedAt: true,
                        }
                    }
                }
            });

            return {
                trainers: trainerAttendances.map(trainer => ({
                    id: trainer.id,
                    email: trainer.email,
                    name: trainer.name,
                    studentId: trainer.studentId,
                    status: trainer.trainerAttendances[0]?.status ?? 'UNMARKED',
                    markedAt: trainer.trainerAttendances[0]?.updatedAt ?? null,
                }))
            };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to retrieve trainer attendances");
        }
    }

    async updateTrainerAttendance(sessionId: number, trainerId: number, status: AttendanceStatus) {
        try {
            const trainerAttendance = await prisma.trainerAttendance.update({
                where: {
                    trainerId_sessionId: {
                        sessionId: sessionId,
                        trainerId: trainerId,
                    },
                },
                data: {
                    status: status,
                },
                select: {
                    id: true,
                    trainerId: true,
                    sessionId: true,
                    status: true,
                }
            });
            return trainerAttendance;
        } catch (error) {
            if (
                error &&
                typeof error === "object" &&
                "code" in error &&
                (error as { code?: string }).code === "P2025"
            ) {
                throw ApiError.notFound("Trainer attendance not found");
            }
            throw ApiError.internal("Failed to update trainer attendance");
        }
    }
}

export default new TrainerAttendanceService();