import { prisma } from "../../lib/prisma.js";
import ApiError from "../../utils/ApiError.js";

class AuthService {
    async checkEmail(email: string) {
        try {
            const user = await prisma.user.findUnique({
                where: { email: email },
                select: { id: true } 
            });

            if (!user) {
                throw ApiError.unauthorized("User is not allowed to register");
            }

            return user;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw ApiError.internal("Failed to verify user access");
        }
    }
}

export default new AuthService();
