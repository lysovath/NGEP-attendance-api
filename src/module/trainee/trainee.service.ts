import ApiError from "../../utils/ApiError.js";
import { prisma } from "../../lib/prisma.js";
import { removeUndefined } from "../../utils/removeUndefined.js";


interface TraineeData {
    email: string;
    name: string;
    studentId: string;
}

class TraineeService {
    async createTrainee(TraineeData: TraineeData) {
        try {
            const existingTrainee = await prisma.trainee.findUnique({
                where: { email: TraineeData.email },
            });
            if (existingTrainee) {
                throw ApiError.conflict("Trainee with this email already exists");
            }
            const trainee = await prisma.trainee.create({
                data: {
                    email: TraineeData.email,
                    name: TraineeData.name,
                    studentId: TraineeData.studentId,
                },
                select: {
                    id: true,
                    email: true,
                    groupId: true,
                }
            });
            return trainee;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to create trainee");
        }
    }

    async getAllTrainees(groupId?: number) {
        try {
            const trainees = await prisma.trainee.findMany({
                where: groupId ? { groupId: groupId } : {},
                select: {
                    id: true,
                    email: true,
                    name: true,
                    studentId: true,
                    groupId: true,
                }
            });
            return trainees;
        } catch (error) {
            throw ApiError.internal("Failed to retrieve trainees");
        }
    }

    async updateTrainee(id: number, TraineeData: Partial<TraineeData>) {
        try {
            const existingTrainee = await prisma.trainee.findUnique({
                where: { id: id },
            });

            if (!existingTrainee) {
                throw ApiError.notFound("Trainee not found");
            }

            const trainee = await prisma.trainee.update({
                where: { id: id },
                data: removeUndefined({
                    email: TraineeData.email,
                    name: TraineeData.name,
                    studentId: TraineeData.studentId,
                }),
                select: {
                    id: true,
                    email: true,
                    name: true,
                    studentId: true,
                    groupId: true,
                }
            });
            return trainee;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to update trainee");
        }
    }

    async deleteTrainee(id: number) {
        try {
            const existingTrainee = await prisma.trainee.findUnique({
                where: { id: id },
            });
            if (!existingTrainee) {
                throw ApiError.notFound("Trainee not found");
            }

            await prisma.trainee.delete({
                where: { id: id },
            });
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to delete trainee");
        }
    }
}

export default new TraineeService();