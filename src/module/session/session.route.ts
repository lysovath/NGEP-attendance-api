import sessionController from "./session.controller.js";
import { Router } from "express";

import {checkRole} from "../../middleware/auth.js";
import { Role } from "@prisma/client";
import validateSchema from "../../middleware/validateSchema.js";
import {
    createSessionSchema,
    getAllSessions,
    updateSessionSchema,
    sessionIdParamSchema
} from "./session.schema.js";
import trainerAttendanceRouter from "../trainer-attendance/trainerAttendance.route.js";
import traineeAttendanceRouter from "../trainee-attendance/traineeAttendance.route.js";
import { authorizeSession } from "../../middleware/authorizeSession.js";
import { authorizeGroupQuery } from "../../middleware/authorizeGroup.js";


const router = Router();

router.get(
    "/",
    validateSchema({
        query: getAllSessions.shape.query,
    }),
    authorizeGroupQuery,
    sessionController.getAllSessions,
);

router.post(
    "/",
    checkRole(Role.ADMIN),
    validateSchema({
        body: createSessionSchema.shape.body,
    }),
    sessionController.createSession,
);



router.get(
    "/:sessionId",
    validateSchema({
        params: sessionIdParamSchema.shape.params,
    }),
    authorizeSession,
    sessionController.getSessionById,
);

router.put(
    "/:sessionId",
    checkRole(Role.ADMIN),
    validateSchema({
        params: sessionIdParamSchema.shape.params,
        body: updateSessionSchema.shape.body,
    }),
    sessionController.updateSession,
);

router.delete(
    "/:sessionId",
    checkRole(Role.ADMIN),
    validateSchema({
        params: sessionIdParamSchema.shape.params,
    }),
    sessionController.deleteSession,
);

router.get(
    "/:sessionId/roster",
    checkRole(Role.ADMIN),
    validateSchema({
        params: sessionIdParamSchema.shape.params,
    }),
    sessionController.getSessionRoster,
);

router.use(
    "/:sessionId/trainer-attendances", trainerAttendanceRouter
);

router.use(
    "/:sessionId/trainee-attendances", traineeAttendanceRouter
);

export default router;