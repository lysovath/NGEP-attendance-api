import { Router } from "express";
import { isAuthenticated, checkRole } from "../middleware/auth.js";
import courseRouter from "../module/course/course.route.js";
import userRouter from "../module/user/user.route.js";
import groupRouter from "../module/group/group.route.js";
import sessionRouter from "../module/session/session.route.js";
import traineeRouter from "../module/trainee/trainee.route.js";

const router = Router();



router.use(isAuthenticated);

router.get("/me", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: req.dbUser,
    });
});

router.use("/groups", groupRouter);

router.use("/sessions", sessionRouter);

router.use("/trainees", traineeRouter);

router.use(checkRole("ADMIN"));



router.use("/courses", courseRouter);

router.use("/users", userRouter);

export default router;