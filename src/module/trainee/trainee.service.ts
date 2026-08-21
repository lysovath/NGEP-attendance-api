import ApiError from "../../utils/ApiError.js";
import { prisma } from "../../lib/prisma.js";
import { removeUndefined } from "../../utils/removeUndefined.js";


interface TraineeData {
    email: string;
    name: string;
    studentId?: string;
    groupId?: number;
}

interface TraineeImportRow {
    name: string;
    email: string;
    studentId?: string;
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
                    studentId: TraineeData.studentId ?? null,
                    groupId: TraineeData.groupId ?? null,
                },
                select: {
                    id: true,
                    email: true,
                    groupId: true,
                    name: true,
                    studentId: true,
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

    async importTrainees(rows: TraineeImportRow[], groupId?: number) {
        try {
            if (!rows || rows.length === 0) {
                throw ApiError.badRequest("No trainees to import");
            }

            const cleaned = rows
                .map((r) => ({
                    name: String(r.name ?? "").trim(),
                    email: String(r.email ?? "").trim().toLowerCase(),
                    studentId: r.studentId ? String(r.studentId).trim() : null,
                }))
                .filter((r) => r.name && r.email);

            const emails = cleaned.map((r) => r.email);
            const existing = await prisma.trainee.findMany({
                where: { email: { in: emails } },
                select: { email: true },
            });
            const existingEmails = new Set(existing.map((e) => e.email.toLowerCase()));

            const seen = new Set<string>();
            const toCreate = cleaned.filter((r) => {
                if (existingEmails.has(r.email) || seen.has(r.email)) return false;
                seen.add(r.email);
                return true;
            });

            if (toCreate.length > 0) {
                await prisma.trainee.createMany({
                    data: toCreate.map((r) => ({
                        name: r.name,
                        email: r.email,
                        studentId: r.studentId,
                        groupId: groupId ?? null,
                    })),
                    skipDuplicates: true,
                });
            }

            return {
                created: toCreate.length,
                skipped: cleaned.length - toCreate.length,
                total: rows.length,
            };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to import trainees");
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