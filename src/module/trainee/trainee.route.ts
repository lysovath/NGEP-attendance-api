import traineeController from "./trainee.controller.js";
import { Router } from "express";
import validateSchema from "../../middleware/validateSchema.js";
import {
    createTraineeSchema,
    updateTraineeSchema,
    traineeIdParamSchema,
    getTraineeSchema
} from "./trainee.schema.js";
import { checkRole } from "../../middleware/auth.js";
import { Role } from "@prisma/client";
import { authorizeGroupQuery } from "../../middleware/authorizeGroup.js";

const router = Router();

router.get(
    "/",
    authorizeGroupQuery,
    validateSchema({
        query: getTraineeSchema.shape.query,
    }),
    traineeController.getAllTrainees,
);

router.use(checkRole(Role.ADMIN));

router.post(
    "/",
    validateSchema({
        body: createTraineeSchema.shape.body,
    }),
    traineeController.createTrainee,
);

router.put(
    "/:id",
    validateSchema({
        params: traineeIdParamSchema.shape.params,
        body: updateTraineeSchema.shape.body,
    }),
    traineeController.updateTrainee,
);

router.delete(
    "/:id",
    validateSchema({
        params: traineeIdParamSchema.shape.params,
    }),
    traineeController.deleteTrainee,
);

export default router;