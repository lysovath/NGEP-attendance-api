import type { Request, Response, NextFunction } from "express";
import trainerAttendanceService from "./trainerAttendance.service.js";

class TrainerAttendanceController {
    async createTrainerAttendance(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: sessionId } = req.params;
            const { trainerId, status } = req.body;
            const trainerData = { trainerId: Number(trainerId), status };
            const trainerAttendance = await trainerAttendanceService.createTrainerAttendance(Number(sessionId), trainerData);
            return res.status(201).json({
                success: true,
                message: "Trainer attendance created successfully",
                data: trainerAttendance,
            });
        } catch (error) {
            next(error);
        }
    }

    async batchCreateTrainerAttendance(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: sessionId } = req.params;
            const attendanceData = req.body.map((data: { trainerId: number; status: string }) => ({
                trainerId: Number(data.trainerId),
                status: data.status,
            }));

            const trainerAttendances = await trainerAttendanceService.batchCreateTrainerAttendance(Number(sessionId), attendanceData);
            return res.status(201).json({
                success: true,
                message: "Trainer attendances created successfully",
                data: trainerAttendances,
            });
        } catch (error) {
            next(error);
        }
    }

    async getTrainerAttendanceBySessionId(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: sessionId } = req.params;
            const trainerAttendances = await trainerAttendanceService.getTrainerAttendanceBySessionId(Number(sessionId));
            return res.status(200).json({
                success: true,
                message: "Trainer attendances retrieved successfully",
                data: trainerAttendances,
            });
        } catch (error) {
            next(error);
        }
    }

    async getTrainerAttendanceByTrainerId(req: Request, res: Response, next: NextFunction) {
        try {
            const { id: trainerId } = req.params;
            const trainerAttendances = await trainerAttendanceService.getTrainerAttendanceByTrainerId(Number(trainerId));
            return res.status(200).json({
                success: true,
                message: "Trainer attendances retrieved successfully",
                data: trainerAttendances,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateTrainerAttendance(req: Request, res: Response, next: NextFunction) {
        try {
            const { sessionId } = req.params;
            const { trainerId, status } = req.body;
            const updatedTrainerAttendance = await trainerAttendanceService.updateTrainerAttendance(Number(sessionId), Number(trainerId), status);
            return res.status(200).json({
                success: true,
                message: "Trainer attendance updated successfully",
                data: updatedTrainerAttendance,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new TrainerAttendanceController();