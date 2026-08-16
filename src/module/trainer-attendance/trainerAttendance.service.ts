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

    async batchCreateTrainerAttendance(sessionId: number, attendanceData: TrainerAttendanceData[]){
        try {
            const trainerAttendances = await prisma.trainerAttendance.createMany({
                data: attendanceData.map(data => ({
                    trainerId: data.trainerId,
                    sessionId: sessionId,
                    status: data.status,
                })),
                skipDuplicates: true,
            });
            return trainerAttendances;
        } catch (error) {
            throw ApiError.internal("Failed to create trainer attendances");
        }
    }

    async getTrainerAttendanceBySessionId(sessionId: number) {
        try {
            const trainerAttendances = await prisma.trainerAttendance.findMany({
                where: { sessionId: sessionId },
                select: {
                    id: true,
                    trainerId: true,
                    sessionId: true,
                    status: true,
                }
            });
            return trainerAttendances;
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