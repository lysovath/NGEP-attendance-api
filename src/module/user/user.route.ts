import type { Request, Response, NextFunction } from "express";
import { Router } from "express";


import UserController from "./user.controller.js";
import { ApiError } from "../../utils/ApiError.js";
import validateSchema from "../../middleware/validateSchema.js";
import {
  createUserSchema,
  getUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from "./user.schema.js";

const router = Router();

router.post(
    "/",
    validateSchema({
        body: createUserSchema.shape.body,
    }),
    UserController.createUser,
);

router.get(
    "/",
    validateSchema({
        query: getUserSchema.shape.query,
    }),
    UserController.getUser,
);

router.put(
    "/:id",
    validateSchema({
        params: userIdParamSchema.shape.params,
        body: updateUserSchema.shape.body,
    }),
    UserController.updateUser,
);

router.patch(
    "/:id/deactivate",
    validateSchema({
        params: userIdParamSchema.shape.params,
    }),
    UserController.deactivateUser,
);

router.delete(
    "/:id",
    validateSchema({
        params: userIdParamSchema.shape.params,
    }),
    UserController.deleteUser,
);

export default router;

