import ApiError from "../../utils/ApiError.js";
import { prisma } from "../../lib/prisma.js";
import { Role } from "@prisma/client";

class GroupService {
    
    async createGroup(name: string) {
        try {
            const group = await prisma.group.create({
                data: {
                    name: name,
                },
                select: {
                    id: true,
                    name: true,
                }
            });
            return group;
        } catch (error) {
            throw ApiError.internal("Failed to create group");
        }
    }

    async getAllGroups() {
        try {
            const groups = await prisma.group.findMany({
                select: {
                    id: true,
                    name: true,
                }
            });
            return groups;
        } catch (error) {
            throw ApiError.internal("Failed to retrieve groups");
        }
    }

    async updateGroup(id: number, name: string) {
        try {
            const existingGroup = await prisma.group.findUnique({
                where: { id: id },
            });

            if (!existingGroup) {
                throw ApiError.notFound("Group not found");
            }
            const group = await prisma.group.update({
                where: { id: id },
                data: { name: name },
                select: {
                    id: true,
                    name: true,
                }
            });
            return group;
        } catch (error) {
            if( error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to update group");
        }
    }

    async deleteGroup(id: number) {
        try {
            const existingGroup = await prisma.group.findUnique({
                where: { id: id },
            });

            if (!existingGroup) {
                throw ApiError.notFound("Group not found");
            }
            
            await prisma.group.delete({
                where: { id: id },
            });
        } catch (error) {
            if( error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to delete group");
        }
    }

    async getGroupById(id: number) {
        try {
            const group = await prisma.group.findUnique({
                where: { id: id },
                select: {
                    id: true,
                    name: true,
                    users: {
                        where: { isActive: true, role: Role.TRAINER },
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            role: true,
                            studentId: true,
                        }
                    },
                    trainees: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            studentId: true,
                        }
                    }
                }
            });
            if (!group) {
                throw ApiError.notFound("Group not found");
            }
            return {
                id: group.id,
                name: group.name,
                trainers: group.users,
                trainees: group.trainees,
            };
        } catch (error) {
            if( error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to retrieve group");
        }
    }

    async updateGroupTrainers(groupId: number, userIds: number[]) {
        try {
            const existingGroup = await prisma.group.findUnique({
                where: { id: groupId },
            });

            if(!existingGroup) {
                throw ApiError.notFound("Group not found");
            }

            const updatedGroup = await prisma.$transaction([
                prisma.user.updateMany({
                    where: {groupId, id: { notIn: userIds}},
                    data: { groupId: null }
                }),

                prisma.user.updateMany({
                    where: { id: { in: userIds }},
                    data: { groupId }
                })
            ])

            return updatedGroup;
        } catch (error) {
            if(error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to update group trainers");
        }
    }

    async updateGroupTrainees(groupId: number, traineeIds: number[]) {
        try {
            const existingGroup = await prisma.group.findUnique({
                where: { id: groupId },
            });

            if(!existingGroup) {
                throw ApiError.notFound("Group not found");
            }

            const updatedGroup = await prisma.$transaction([
                prisma.trainee.updateMany({
                    where: {groupId, id: { notIn: traineeIds}},
                    data: { groupId: null }
                }),

                prisma.trainee.updateMany({
                    where: { id: { in: traineeIds }},
                    data: { groupId }
                })
            ])

            return updatedGroup;
        } catch (error) {
            if(error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to update group trainees");
        }
    }
}

export default new GroupService();