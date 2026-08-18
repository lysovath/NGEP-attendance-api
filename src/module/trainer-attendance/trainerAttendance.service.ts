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
        
            const createQuery = prisma.trainerAttendance.createMany({
                data: attendanceData.map((data) => ({
                    sessionId,
                    trainerId: data.trainerId,
                    status: data.status,
                })),
                skipDuplicates: true,
            });
        
            const statusGroups = attendanceData.reduce((acc, data) => {
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
            throw ApiError.internal("Failed to retrieve trainer attendances");
        }
    }

    async getTrainerAttendanceByTrainerId(trainerId: number) {
        try {
            const trainerAttendances = await prisma.trainerAttendance.findMany({
                where: { trainerId: trainerId },
                select: {
                    id: true,
                    session: {
                        select: {
                            id: true,
                            name: true,
                            startTime: true,
                            endTime: true,
                        },
                    status: true,
                    }
                }
            });
            return trainerAttendances;
        } catch (error) {
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
            throw ApiError.internal("Failed to update trainer attendance");
        }
    }
}

export default new TrainerAttendanceService();