import type { Request, Response, NextFunction } from "express";
import sessionService from "./session.service.js";

class SessionController {
    async createSession(req: Request, res: Response, next: NextFunction) {
        try {
            const { groupId, courseId, name, startTime, endTime } = req.body;
            const session = await sessionService.createSession(Number(groupId), Number(courseId), {
                name,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
            });
            return res.status(201).json({
                success: true,
                message: "Session created successfully",
                data: session,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllSessionsByGroupCourseId(req: Request, res: Response, next: NextFunction) {
        try {
            const { groupId, courseId } = req.body;
            const sessions = await sessionService.getAllSessionsByGroupCourseId(Number(groupId), Number(courseId));
            return res.status(200).json({
                success: true,
                message: "Sessions retrieved successfully",
                data: sessions,
            });
        } catch (error) {
            next(error);
        }
    }

    async getSessionById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const session = await sessionService.getSessionById(Number(id));
            return res.status(200).json({
                success: true,
                message: "Session retrieved successfully",
                data: session,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateSession(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name, startTime, endTime } = req.body;
            const session = await sessionService.updateSession(Number(id), {
                name,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
            });
            return res.status(200).json({
                success: true,
                message: "Session updated successfully",
                data: session,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteSession(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await sessionService.deleteSession(Number(id));
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export default new SessionController();