import { prisma } from "../../lib/prisma.js";
import ApiError from "../../utils/ApiError.js";
import { Role } from "@prisma/client";
import removeUndefined from "../../utils/removeUndefined.js";

interface CreateUserInput {
    email: string;
    name: string;
    role: Role;
    studentId?: string;
}

class UserService {

    async createUser(input: CreateUserInput) {
        try {
            const user = await prisma.user.create({
                data: {
                    email: input.email,
                    name: input.name ?? null,
                    role: input.role,
                    studentId: input.studentId ?? null,
                },
            });
            return user;
        } catch (error) {
            throw ApiError.internal("Failed to create user");
        }
    }

    async getUser(role?: Role){
        try {
            const users = await prisma.user.findMany({
                where: role ? { role: role } : {},
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    studentId: role === Role.ADMIN ? false : true,
                }
            });
            return users;
        } catch (error) {
            throw ApiError.internal("Failed to retrieve users");
        }
    }

    async updateUser(id: number, input: Partial<CreateUserInput>) {
        try {
            const existingUser = await prisma.user.findUnique({
                where: { id: id },
            });

            if (!existingUser) {
                throw ApiError.notFound("User not found");
            }

            const user = await prisma.user.update({
                where: { id: id },
                data: removeUndefined({
                    email: input.email,
                    name: input.name,
                    role: input.role,
                    studentId: input.studentId,
                }),
                select: {
                    id: true,
                    name: true,
                    role: true,
                    email: true,
                    studentId: input.role === Role.ADMIN ? false : true,
                }
            });
            return user;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to update user");
        }
    }

    async deactivateUser(id: number) {
        try {
            const existingUser = await prisma.user.findUnique({
                where: { id: id },
            });

            if (!existingUser) {
                throw ApiError.notFound("User not found");
            }

            const user = await prisma.user.update({
                where: { id: id },
                data: { isActive: false },
                select: {
                    id: true,
                    name: true,
                    role: true,
                    email: true,
                    studentId: existingUser.role === Role.ADMIN ? false : true,
                }
            });
            return user;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to deactivate user");
        }
    }

    async deleteUser(id: number) {
        try {
            const existingUser = await prisma.user.findUnique({
                where: { id: id },
            });

            if (!existingUser) {
                throw ApiError.notFound("User not found");
            }

            await prisma.user.delete({
                where: { id: id },
            });
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to delete user");
        }
    }
}

export default new UserService();