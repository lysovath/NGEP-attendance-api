import type { Request, Response, NextFunction } from "express";
import groupService from "./group.service.js";

class GroupController {
    async createGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const { name } = req.body;
            const group = await groupService.createGroup(name);
            return res.status(201).json({
                success: true,
                message: "Group created successfully",
                data: group,
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllGroups(req: Request, res: Response, next: NextFunction) {
        try {
            const groups = await groupService.getAllGroups();
            return res.status(200).json({
                success: true,
                message: "Groups retrieved successfully",
                data: groups,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const group = await groupService.updateGroup(Number(id), name);
            return res.status(200).json({
                success: true,
                message: "Group updated successfully",
                data: group,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await groupService.deleteGroup(Number(id));
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async getGroupById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const group = await groupService.getGroupById(Number(id));
            return res.status(200).json({
                success: true,
                message: "Group retrieved successfully",
                data: group,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateGroupTrainers(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { trainerIds } = req.body;
            const group = await groupService.updateGroupTrainers(Number(id), trainerIds);
            return res.status(200).json({
                success: true,
                message: "Group trainers updated successfully",
                data: group,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateGroupTrainees(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { traineeIds } = req.body;
            const group = await groupService.updateGroupTrainees(Number(id), traineeIds);
            return res.status(200).json({
                success: true,
                message: "Group students updated successfully",
                data: group,
            });
        } catch (error) {
            next(error);
        }
    }

    async addCourseToGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { courseId } = req.body;
            const groupCourse = await groupService.createGroupCourse(Number(id), Number(courseId));
            return res.status(201).json({
                success: true,
                message: "Course added to group successfully",
                data: groupCourse,
            });
        } catch (error) {
            next(error);
        }
    }

    async getGroupCourses(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const groupCourses = await groupService.getGroupCourseByGroupId(Number(id));
            return res.status(200).json({
                success: true,
                message: "Group courses retrieved successfully",
                data: groupCourses,
            });
        } catch (error) {
            next(error);
        }
    }

    async removeCourseFromGroup(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { courseId } = req.body;
            await groupService.deleteGroupCourse(Number(id), Number(courseId));
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export default new GroupController();