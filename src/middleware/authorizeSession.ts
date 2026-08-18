import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { Role } from "@prisma/client"
import { prisma } from "../lib/prisma.js";


export const authorizeSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sessionId = Number(req.params.sessionId || undefined);
        console.log(req.params);
        console.log(sessionId);
        const session = await prisma.session.findUnique({
            where: {id: sessionId },
            select: {
                groupCourse: {
                    select: {
                        groupId: true
                    }
                }
            }
        })

        if(!session){
            throw ApiError.notFound("Session Not Found");
        }
        if(req.dbUser.role !== Role.ADMIN && req.dbUser.groupId != session.groupCourse.groupId){
            throw ApiError.unauthorized("User is not Authorized");
        }

        return next();
    } catch (error) {
        if(error instanceof ApiError){
            throw error;
        }
        throw ApiError.internal("Internal Server Error");
    }
}