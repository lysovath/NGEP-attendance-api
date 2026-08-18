import authController from "./auth.controller.js";
import { Router } from "express";
import validateSchema from "../../middleware/validateSchema.js";
import { verifyEmailSchema } from "./auth.schema.js";

const router = Router();

router.post(
    "/check-email",
    validateSchema({
        body: verifyEmailSchema.shape.body,
    }),
    authController.checkEmail,
);

export default router;