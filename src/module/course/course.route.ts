import courseController from "./course.controller.js";
import { Router } from "express";
import validateSchema from "../../middleware/validateSchema.js";
import {
  createCourseSchema,
  updateCourseSchema,
  deleteCourseSchema,
} from "./course.schema.js";

const router = Router();

router.post(
  "/",
  validateSchema({
    body: createCourseSchema.shape.body,
  }),
  courseController.createCourse,
);
router.get("/", courseController.getAllCourses);
router.put(
  "/:id",
  validateSchema({
    params: updateCourseSchema.shape.params,
    body: updateCourseSchema.shape.body,
  }),
  courseController.updateCourse,
);
router.delete(
  "/:id",
  validateSchema({
    params: deleteCourseSchema.shape.params,
  }),
  courseController.deleteCourse,
);

export default router;