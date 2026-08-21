import { Router } from "express";
import traineeAttendanceController from "./traineeAttendance.controller.js";
import validateSchema from "../../middleware/validateSchema.js";
import {
    getTraineeBySessionIdSchema,
    batchCreateTraineeAttendanceSchema,
} from "./traineeAttendance.schema.js";
import { authorizeSession } from "../../middleware/authorizeSession.js";

const router = Router({ mergeParams: true });

router.get(
    "/",
    validateSchema({
        params: getTraineeBySessionIdSchema.shape.params,
    }),
    authorizeSession,
    traineeAttendanceController.getTraineeAttendanceBySessionId,
);

router.post(
    "/batch",
    validateSchema({
        params: batchCreateTraineeAttendanceSchema.shape.params,
        body: batchCreateTraineeAttendanceSchema.shape.body,
    }),
    authorizeSession,
    traineeAttendanceController.batchCreateTraineeAttendance,
);

router.post(
    "/import",
    validateSchema({
        params: getTraineeBySessionIdSchema.shape.params,
    }),
    authorizeSession,
    traineeAttendanceController.importTraineeAttendance,
);

router.get(
    "/export",
    validateSchema({
        params: getTraineeBySessionIdSchema.shape.params,
    }),
    authorizeSession,
    traineeAttendanceController.exportRoster,
);

export default router;
