import { Router } from "express";
import enrollmentController from "./enrollment.controller.js";
import validateSchema from "../../middleware/validateSchema.js";
import { checkRole } from "../../middleware/auth.js";
import { Role } from "@prisma/client";
import {
    listEnrollmentsSchema,
    rosterSchema,
    bulkAssignSchema,
    removeAssignmentsSchema,
    resetDaySchema,
    copyDaySchema,
} from "./enrollment.schema.js";

const router = Router();

router.use(checkRole(Role.ADMIN));

router.get(
    "/roster",
    validateSchema({ query: rosterSchema.shape.query }),
    enrollmentController.getRoster,
);

router.get(
    "/",
    validateSchema({ query: listEnrollmentsSchema.shape.query }),
    enrollmentController.getOverrides,
);

router.post(
    "/bulk",
    validateSchema({ body: bulkAssignSchema.shape.body }),
    enrollmentController.bulkAssign,
);

router.post(
    "/remove",
    validateSchema({ body: removeAssignmentsSchema.shape.body }),
    enrollmentController.removeAssignments,
);

router.post(
    "/reset",
    validateSchema({ body: resetDaySchema.shape.body }),
    enrollmentController.resetDay,
);

router.post(
    "/copy",
    validateSchema({ body: copyDaySchema.shape.body }),
    enrollmentController.copyDay,
);

export default router;
