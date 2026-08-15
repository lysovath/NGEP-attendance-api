import sessionController from "./session.controller.js";
import { Router } from "express";
import validateSchema from "../../middleware/validateSchema.js";
import {
    createSessionSchema,
    getAllSessionsByGroupCourseIdSchema,
    updateSessionSchema,
    sessionIdParamSchema
} from "./session.schema.js";

const router = Router();

router.post(
    "/",
    validateSchema({
        body: createSessionSchema.shape.body,
    }),
    sessionController.createSession,
);

router.get(
    "/",
    validateSchema({
        body: getAllSessionsByGroupCourseIdSchema.shape.body,
    }),
    sessionController.getAllSessionsByGroupCourseId,
);

router.get(
    "/:id",
    validateSchema({
        params: sessionIdParamSchema.shape.params,
    }),
    sessionController.getSessionById,
);

router.put(
    "/:id",
    validateSchema({
        params: sessionIdParamSchema.shape.params,
        body: updateSessionSchema.shape.body,
    }),
    sessionController.updateSession,
);

router.delete(
    "/:id",
    validateSchema({
        params: sessionIdParamSchema.shape.params,
    }),
    sessionController.deleteSession,
);

export default router;