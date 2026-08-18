import type { Request, Response, NextFunction } from "express";
import traineeAttendanceService from "./traineeAttendance.service.js";

class TraineeAttendanceController {
    async getTraineeAttendanceBySessionId(req: Request, res: Response, next: NextFunction) {
        try {
            const { sessionId } = req.params;
            const traineeAttendances = await traineeAttendanceService.getTraineeAttendances(Number(sessionId));
            return res.status(200).json({
                success: true,
                message: "Trainee attendances retrieved successfully",
                data: traineeAttendances,
            });
        } catch (error) {
            next(error);
        }
    }

    async batchCreateTraineeAttendance(req: Request, res: Response, next: NextFunction) {
        try {
            const { sessionId } = req.params;
            const attendanceData = req.body.map((data: { traineeId: number; status: string }) => ({
                traineeId: Number(data.traineeId),
                status: data.status,
            }));
            const traineeAttendances = await traineeAttendanceService.batchCreateTraineeAttendance(Number(sessionId), attendanceData);
            return res.status(201).json({
                success: true,
                message: "Trainee attendances created successfully",
                data: traineeAttendances,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new TraineeAttendanceController();