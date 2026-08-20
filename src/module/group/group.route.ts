import { Router } from "express";

import { Role } from "@prisma/client";
import GroupController from "./group.controller.js";
import validateSchema from "../../middleware/validateSchema.js";
import { authorizeGroup } from "../../middleware/authorizeGroup.js";
import {
  createGroupSchema,
  updateGroupSchema,
  groupIdParamSchema,
  updateGroupTrainersSchema,
  updateGroupTraineesSchema,
  deleteGroupCourseSchema,
  addGroupCourseSchema
} from "./group.schema.js";
import { checkRole } from "../../middleware/auth.js";

const router = Router();

router.get(
    "/:id",
    authorizeGroup,
    validateSchema({
        params: groupIdParamSchema.shape.params,
    }),
    GroupController.getGroupById,
);


router.post(
    "/",
    checkRole(Role.ADMIN),
    validateSchema({
        body: createGroupSchema.shape.body,
    }),
    GroupController.createGroup,
);

router.get("/", GroupController.getAllGroups);


router.put(
    "/:id",
    checkRole(Role.ADMIN),
    validateSchema({
        params: groupIdParamSchema.shape.params,
        body: updateGroupSchema.shape.body,
    }),
    GroupController.updateGroup,
);

router.delete(
    "/:id",
    checkRole(Role.ADMIN),
    validateSchema({
        params: groupIdParamSchema.shape.params,
    }),
    GroupController.deleteGroup,
);



router.put(
    "/:id/trainers",
    checkRole(Role.ADMIN),
    validateSchema({
        params: groupIdParamSchema.shape.params,
        body: updateGroupTrainersSchema.shape.body,
    }),
    GroupController.updateGroupTrainers,
);

router.put(
    "/:id/trainees",
    checkRole(Role.ADMIN),
    validateSchema({
        params: groupIdParamSchema.shape.params,
        body: updateGroupTraineesSchema.shape.body,
    }),
    GroupController.updateGroupTrainees,
);



router.post(
    "/:id/courses",
    checkRole(Role.ADMIN),
    validateSchema({
        params: addGroupCourseSchema.shape.params,
        body: addGroupCourseSchema.shape.body,
    }),
    GroupController.addCourseToGroup,
);

router.get(
    "/:id/courses",
    authorizeGroup,
    validateSchema({
        params: groupIdParamSchema.shape.params,
    }),
    GroupController.getGroupCourses,
);

router.delete(
    "/:id/courses",
    checkRole(Role.ADMIN),
    validateSchema({
        params: deleteGroupCourseSchema.shape.params,
        body: deleteGroupCourseSchema.shape.body,
    }),
    GroupController.removeCourseFromGroup,
);

export default router;