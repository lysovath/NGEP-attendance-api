import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export const authorizeSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sessionId = Number(req.params.sessionId);

        if (!Number.isInteger(sessionId)) {
            throw ApiError.badRequest("Invalid session id");
        }

        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            select: {
                groupCourse: {
                    select: {
                        groupId: true,
                    },
                },
            },
        });

        if (!session || !session.groupCourse) {
            throw ApiError.notFound("Session Not Found");
        }

        if (req.dbUser.role !== Role.ADMIN && req.dbUser.groupId !== session.groupCourse.groupId) {
            throw ApiError.forbidden("You do not have access to this session");
        }

        return next();
    } catch (error) {
        if (error instanceof ApiError) {
            return next(error);
        }
        return next(ApiError.internal("Internal Server Error"));
    }
};
