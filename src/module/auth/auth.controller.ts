import type { Request, Response, NextFunction } from "express";
import authService from "./auth.service.js";
import { ApiError } from "../../utils/ApiError.js";


class AuthController {
    async checkEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            const isEmailValid = await authService.checkEmail(email);
            return res.status(200).json({
                success: true,
                message: "Email verification successful",
                data: { isEmailValid },
            });
        } catch (error) {
            if( error instanceof ApiError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                });
            } else {
                return next(error);
            }
        }
    }
}

export default new AuthController();