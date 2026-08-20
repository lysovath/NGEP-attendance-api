import type { Request, Response, NextFunction } from "express";
import enrollmentService from "./enrollment.service.js";

class EnrollmentController {
    async getRoster(req: Request, res: Response, next: NextFunction) {
        try {
            const { date, groupId } = req.query;
            const roster = await enrollmentService.getRoster(Number(groupId), new Date(String(date)));
            return res.status(200).json({
                success: true,
                message: "Roster retrieved successfully",
                data: roster,
            });
        } catch (error) {
            next(error);
        }
    }

    async getOverrides(req: Request, res: Response, next: NextFunction) {
        try {
            const { date, groupId } = req.query;
            const overrides = await enrollmentService.getOverrides(
                new Date(String(date)),
                groupId ? Number(groupId) : undefined
            );
            return res.status(200).json({
                success: true,
                message: "Day assignments retrieved successfully",
                data: overrides,
            });
        } catch (error) {
            next(error);
        }
    }

    async bulkAssign(req: Request, res: Response, next: NextFunction) {
        try {
            const { groupId, date, traineeIds } = req.body;
            const roster = await enrollmentService.bulkAssign(
                Number(groupId),
                new Date(String(date)),
                traineeIds.map((id: number) => Number(id))
            );
            return res.status(200).json({
                success: true,
                message: "Trainees assigned for the day successfully",
                data: roster,
            });
        } catch (error) {
            next(error);
        }
    }

    async removeAssignments(req: Request, res: Response, next: NextFunction) {
        try {
            const { date, groupId, traineeIds } = req.body;
            const result = await enrollmentService.removeAssignments(
                new Date(String(date)),
                traineeIds.map((id: number) => Number(id)),
                groupId ? Number(groupId) : undefined
            );
            return res.status(200).json({
                success: true,
                message: "Day assignments removed successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async resetDay(req: Request, res: Response, next: NextFunction) {
        try {
            const { date, groupId } = req.body;
            const result = await enrollmentService.resetDay(
                new Date(String(date)),
                groupId ? Number(groupId) : undefined
            );
            return res.status(200).json({
                success: true,
                message: "Day reset to home groups successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async copyDay(req: Request, res: Response, next: NextFunction) {
        try {
            const { fromDate, toDate } = req.body;
            const result = await enrollmentService.copyDay(
                new Date(String(fromDate)),
                new Date(String(toDate))
            );
            return res.status(200).json({
                success: true,
                message: "Day assignments copied successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new EnrollmentController();
