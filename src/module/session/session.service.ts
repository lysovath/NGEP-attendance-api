import ApiError from "../../utils/ApiError.js";
import { prisma } from "../../lib/prisma.js";
import removeUndefined from "../../utils/removeUndefined.js";
import { SessionType } from "@prisma/client";

interface SessionData {
    name: string;
    type?: SessionType;
    startTime: Date;
    endTime: Date;
}

class SessionService {
    async createSession(groupId: number, courseId: number, sessionData: SessionData) {
        try {
            const session = await prisma.session.create({
                data: {
                    name: sessionData.name,
                    type: sessionData.type ?? SessionType.THEORY,
                    startTime: sessionData.startTime,
                    endTime: sessionData.endTime,
                    groupCourse: {
                        connect: {
                            groupId_courseId: {
                                groupId: groupId,
                                courseId: courseId,
                            },
                        },
                    },
                },
                select: {
                    id: true,
                    startTime: true,
                    endTime: true,
                    name: true,
                    type: true,
                },
            });
            return session;
        } catch (error) {
            throw ApiError.internal("Failed to create session");
        }
    }

    async getAllSessions(groupId: number, courseId: number) {
        try {
            const groupCourse = await prisma.groupCourse.findUnique({
                where: {
                    groupId_courseId: {
                        groupId: groupId,
                        courseId: courseId,
                    },
                },
            });

            if (!groupCourse) {
                throw ApiError.notFound("Course is not found for the group");
            }

            const sessions = await prisma.session.findMany({
                where: {
                    groupCourse: {
                        groupId: groupId,
                        courseId: courseId,
                    },
                },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    startTime: true,
                    endTime: true,
                },
                orderBy: { startTime: "asc" },
            });
            return sessions;
        } catch (error) {
            if(error instanceof ApiError){
                throw error;
            }
            throw ApiError.internal("Failed to retrieve sessions");
        }
    }

    async getSessionById(sessionId: number) {
        try {
            const session = await prisma.session.findUnique({
                where: { id: sessionId },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    startTime: true,
                    endTime: true,
                },
            });

            if (!session) {
                throw ApiError.notFound("Session not found");
            }

            return session;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to retrieve session");
        }
    }

    async updateSession(sessionId: number, sessionData: Partial<SessionData>) {
        try {
            const existingSession = await prisma.session.findUnique({
                where: { id: sessionId },
            });

            if (!existingSession) {
                throw ApiError.notFound("Session not found");
            }

            const session = await prisma.session.update({
                where: { id: sessionId },
                data: removeUndefined({
                    name: sessionData.name,
                    type: sessionData.type,
                    startTime: sessionData.startTime,
                    endTime: sessionData.endTime,
                }),
                select: {
                    id: true,
                    name: true,
                    type: true,
                    startTime: true,
                    endTime: true,
                },
            });
            return session;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to update session");
        }
    }

    async deleteSession(sessionId: number) {
        try {
            const existingSession = await prisma.session.findUnique({
                where: { id: sessionId },
            });

            if (!existingSession) {
                throw ApiError.notFound("Session not found");
            }

            await prisma.session.delete({
                where: { id: sessionId },
            });
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to delete session");
        }
    }
}

export default new SessionService();