import { Router } from "express";
import { isAuthenticated, checkRole } from "../middleware/auth.js";
import courseRouter from "../module/course/course.route.js";
import userRouter from "../module/user/user.route.js";
import groupRouter from "../module/group/group.route.js";
import sessionRouter from "../module/session/session.route.js";
import traineeRouter from "../module/trainee/trainee.route.js";
import authRouter from "../module/auth/auth.route.js";
import enrollmentRouter from "../module/enrollment/enrollment.route.js";
import reportRouter from "../module/report/report.route.js";
import dashboardRouter from "../module/dashboard/dashboard.route.js";

const router = Router();

router.use("/auth", authRouter);

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

router.use("/enrollments", enrollmentRouter);

router.use("/reports", reportRouter);

router.use("/dashboard", dashboardRouter);

router.use(checkRole("ADMIN"));



router.use("/courses", courseRouter);

router.use("/users", userRouter);

export default router;