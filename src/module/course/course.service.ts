import { prisma } from "../../lib/prisma.js";
import ApiError from "../../utils/ApiError.js";
class CourseService {

    async createCourse(name: string){
        try {
            const course = await prisma.course.create({
                data: {
                    name: name,
                },
                select: {
                    id: true,
                    name: true,
                }
            });
            return course;
        } catch (error) {
            throw ApiError.internal("Failed to create course");
        }
    }

    async getAllCourses() {
        try {
            const courses = await prisma.course.findMany({
                select: {
                    id: true,
                    name: true,
                }
            });
            return courses;
        } catch (error) {
            throw ApiError.internal("Failed to retrieve courses");
        }
    }

    async updateCourse(id: number, name: string) {
        try {
            const course = await prisma.course.update({
                where: { id: id },
                data: { name: name },
                select: {
                    id: true,
                    name: true,
                }
            });
            return course;
        } catch (error) {
            throw ApiError.internal("Failed to update course");
        }
    }

    async deleteCourse(id: number) {
        try {
            await prisma.course.delete({
                where: { id: id },
            });
        } catch (error) {
            throw ApiError.internal("Failed to delete course");
        }
    }
}

export default new CourseService();
