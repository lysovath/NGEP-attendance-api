import trainerAttendanceController from "./trainerAttendance.controller.js";
import { Router } from "express";
import validateSchema from "../../middleware/validateSchema.js";
import {
    createTrainerAttendanceSchema,
    getTrainerBySessionIdSchema,
    batchCreateTrainerAttendanceSchema,
    updateTrainerAttendanceSchema,
} from "./trainerAttendance.schema.js";

const router = Router({ mergeParams: true });

router.post(
    "/",
    validateSchema({
        params: createTrainerAttendanceSchema.shape.params,
        body: createTrainerAttendanceSchema.shape.body,
    }),
    trainerAttendanceController.createTrainerAttendance,
);

router.post(
    "/batch",
    validateSchema({
        params: batchCreateTrainerAttendanceSchema.shape.params,
        body: batchCreateTrainerAttendanceSchema.shape.body,
    }),
    trainerAttendanceController.batchCreateTrainerAttendance,
);

router.get(
    "/",
    validateSchema({
        params: getTrainerBySessionIdSchema.shape.params,
    }),
    trainerAttendanceController.getTrainerAttendanceBySessionId,
);

router.put(
    "/:trainerId",
    validateSchema({
        params: updateTrainerAttendanceSchema.shape.params,
        body: updateTrainerAttendanceSchema.shape.body,
    }),
    trainerAttendanceController.updateTrainerAttendance,
);

export default router;