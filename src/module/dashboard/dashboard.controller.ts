import type { Request, Response, NextFunction } from "express";
import dashboardService from "./dashboard.service.js";
import { Role } from "@prisma/client";

class DashboardController {
    async getSummary(req: Request, res: Response, next: NextFunction) {
        try {
            const groupId =
                req.dbUser.role === Role.TRAINER ? req.dbUser.groupId ?? undefined : undefined;

            if (req.dbUser.role === Role.TRAINER && groupId === undefined) {
                return res.status(200).json({
                    success: true,
                    message: "Dashboard summary retrieved successfully",
                    data: {
                        stats: {
                            trainees: 0,
                            trainers: 0,
                            groups: 0,
                            courses: 0,
                            sessions: 0,
                            todaySessions: 0,
                            weekSessions: 0,
                            attendanceRate: null,
                        },
                        todaySessions: [],
                        atRisk: [],
                        groupOverview: [],
                        weekStart: null,
                        weekEnd: null,
                    },
                });
            }

            const summary = await dashboardService.getSummary(groupId);
            return res.status(200).json({
                success: true,
                message: "Dashboard summary retrieved successfully",
                data: summary,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new DashboardController();