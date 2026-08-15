import { Router } from "express";
import { isAuthenticated, checkRole } from "../middleware/auth.js";
import courseRouter from "../module/course/course.route.js";
import userRouter from "../module/user/user.route.js";
import groupRouter from "../module/group/group.route.js";

const router = Router();



router.use(isAuthenticated);

router.use("/groups", groupRouter);

router.use(checkRole("ADMIN"));



router.use("/courses", courseRouter);

router.use("/users", userRouter);

export default router;