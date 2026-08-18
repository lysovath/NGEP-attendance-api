import { prisma } from "../../lib/prisma.js";
import ApiError from "../../utils/ApiError.js";
import { AttendanceStatus } from "@prisma/client";

interface TraineeAttendanceData {
    traineeId: number;
    status: AttendanceStatus;
}

class TraineeAttendanceService {
    async getTraineeAttendances(sessionId: number) {
        try {
            const session = await prisma.session.findUnique({
                where: { id: sessionId },
                select: { groupCourse: { select: { groupId: true } } }
            });

            if (!session || !session.groupCourse) {
                throw ApiError.notFound("Session not found");
            }

            const traineeAttendances = await prisma.trainee.findMany({
                where: { groupId: session.groupCourse.groupId },
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
                        }
                    }
                }
            });

            return {
                trainees: traineeAttendances.map(trainee => ({
                    id: trainee.id,
                    email: trainee.email,
                    name: trainee.name,
                    studentId: trainee.studentId,
                    status: trainee.traineeAttendances[0]?.status ?? 'UNMARKED',
                    markedAt: trainee.traineeAttendances[0]?.updatedAt ?? null,
                }))
            };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
        }
    }

    async batchCreateTraineeAttendance(sessionId: number, attendanceData: TraineeAttendanceData[]) {
        try {

            if(!attendanceData || attendanceData.length === 0) {
                throw ApiError.badRequest("Attendance data is empty");
            }

            const createQuery = prisma.traineeAttendance.createMany({
              data: attendanceData.map((data) => ({
                sessionId,
                traineeId: data.traineeId,
                status: data.status,
              })),
              skipDuplicates: true,
            });

            const statusGroups = attendanceData.reduce((acc, curr) => {
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
}

export default new TraineeAttendanceService();