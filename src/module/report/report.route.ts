import { Router } from "express";
import reportController from "./report.controller.js";
import validateSchema from "../../middleware/validateSchema.js";
import { checkRole } from "../../middleware/auth.js";
import { Role } from "@prisma/client";
import { weeklyReportSchema, exportWeeklyReportSchema } from "./report.schema.js";

const router = Router();

router.use(checkRole(Role.ADMIN));

router.get(
    "/weekly",
    validateSchema({ query: weeklyReportSchema.shape.query }),
    reportController.getWeeklyReport,
);

router.get(
    "/weekly/export",
    validateSchema({ query: exportWeeklyReportSchema.shape.query }),
    reportController.exportWeeklyReport,
);

export default router;
