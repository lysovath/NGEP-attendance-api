import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import GroupController from "./group.controller.js";
import validateSchema from "../../middleware/validateSchema.js";
import {
  createGroupSchema,
  updateGroupSchema,
  groupIdParamSchema,
  updateGroupTrainersSchema,
  updateGroupTraineesSchema,
} from "./group.schema.js";
import { checkRole } from "../../middleware/auth.js";

const router = Router();

router.get(
    "/:id",
    validateSchema({
        params: groupIdParamSchema.shape.params,
    }),
    GroupController.getGroupById,
);

router.use(checkRole("ADMIN"));

router.post(
    "/",
    validateSchema({
        body: createGroupSchema.shape.body,
    }),
    GroupController.createGroup,
);

router.get("/", GroupController.getAllGroups);


router.put(
    "/:id",
    validateSchema({
        params: groupIdParamSchema.shape.params,
        body: updateGroupSchema.shape.body,
    }),
    GroupController.updateGroup,
);

router.delete(
    "/:id",
    validateSchema({
        params: groupIdParamSchema.shape.params,
    }),
    GroupController.deleteGroup,
);


router.use("/:id");

router.put(
    "/trainers",
    validateSchema({
        params: groupIdParamSchema.shape.params,
        body: updateGroupTrainersSchema.shape.body,
    }),
    GroupController.updateGroupTrainers,
);

router.put(
    "/trainees",
    validateSchema({
        params: groupIdParamSchema.shape.params,
        body: updateGroupTraineesSchema.shape.body,
    }),
    GroupController.updateGroupTrainees,
);

router.use("/courses");

router.post(
    "/",
    validateSchema({
        params: groupIdParamSchema.shape.params,
    }),
    GroupController.addCourseToGroup,
);

router.get(
    "/",
    validateSchema({
        params: groupIdParamSchema.shape.params,
    }),
    GroupController.getGroupCourses,
);

router.delete(
    "/",
    validateSchema({
        params: groupIdParamSchema.shape.params,
    }),
    GroupController.removeCourseFromGroup,
);

export default router;