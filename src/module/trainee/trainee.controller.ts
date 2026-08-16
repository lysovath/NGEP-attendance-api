import traineeService from "./trainee.service.js";
import type { Request, Response, NextFunction } from "express";

class TraineeController {
    async getAllTrainees(req: Request, res: Response, next: NextFunction) {
        try {
            const { groupId } = req.query;
            const trainees = await traineeService.getAllTrainees(Number(groupId));
            return res.status(200).json({
                success: true,
                message: "Trainees retrieved successfully",
                data: trainees,
            });
        } catch (error) {
            next(error);
        }
    }

    async createTrainee(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, name, studentId, groupId } = req.body;
            const trainee = await traineeService.createTrainee({ email, name, studentId });
            return res.status(201).json({
                success: true,
                message: "Trainee created successfully",
                data: trainee,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateTrainee(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { email, name, studentId } = req.body;
            const trainee = await traineeService.updateTrainee(Number(id), { email, name, studentId });
            return res.status(200).json({
                success: true,
                message: "Trainee updated successfully",
                data: trainee,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteTrainee(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await traineeService.deleteTrainee(Number(id));
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export default new TraineeController();