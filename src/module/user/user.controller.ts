import type { Request, Response, NextFunction } from "express";
import userService from "./user.service.js";
import { ApiError } from "../../utils/ApiError.js";

class UserController {
    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, name, role, studentId } = req.body;
            const user = await userService.createUser({ email, name, role, studentId });
            return res.status(201).json({
                success: true,
                message: "User created successfully",
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    async getUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { role, groupId } = req.query;
            const users = await userService.getUser(role as any, Number(groupId));
            return res.status(200).json({
                success: true,
                message: "Users retrieved successfully",
                data: users,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { email, name, role, studentId } = req.body;
            const user = await userService.updateUser(Number(id), { email, name, role, studentId });
            return res.status(200).json({
                success: true,
                message: "User updated successfully",
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    async deactivateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const user = await userService.deactivateUser(Number(id));
            return res.status(200).json({
                success: true,
                message: "User deactivated successfully",
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await userService.deleteUser(Number(id));
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();