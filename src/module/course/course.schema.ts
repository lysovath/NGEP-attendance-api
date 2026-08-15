import { z } from "zod";

export const createCourseSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Course name is required"),
    }),
});

export const updateCourseSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "Course ID must be a number"),
    }),
    body: z.object({
        name: z.string().min(1, "Course name is required"),
    }),
});

export const deleteCourseSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "Course ID must be a number"),
    }),
});