import courseService from "./course.service.js";
import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../../utils/ApiError.js";

class CourseController {
    async createCourse(req: Request, res: Response, next: NextFunction) {
        try {
            const { name } = req.body;
            const course = await courseService.createCourse(name);
            return res.status(201).json(course);
        } catch (error) {
            next(error);
        }
    }

    async getAllCourses(req: Request, res: Response, next: NextFunction) {
        try {
            const courses = await courseService.getAllCourses();
            return res.status(200).json(courses);
        } catch (error) {
            next(error);
        }
    }

    async updateCourse(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const course = await courseService.updateCourse(Number(id), name);
            return res.status(200).json(course);
        } catch (error) {
            next(error);
        }
    }

    async deleteCourse(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await courseService.deleteCourse(Number(id));
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export default new CourseController();