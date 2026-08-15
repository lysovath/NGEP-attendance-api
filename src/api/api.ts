import { Router } from "express";
import { isAuthenticated, checkRole } from "../middleware/auth.js";
import courseRouter from "../module/course/course.route.js";


const router = Router();



router.use(isAuthenticated);


router.use(checkRole("ADMIN"));



router.use("/courses", courseRouter);



export default router;