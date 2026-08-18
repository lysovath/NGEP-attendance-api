import { z } from "zod";

export const createSessionSchema = z.object({
    body: z.object({
        groupId: z.number().int().positive("Group ID must be a positive integer"),
        courseId: z.number().int().positive("Course ID must be a positive integer"),
        name: z.string().min(1, "Session name is required"),
        startTime: z.string().refine((value) => !isNaN(Date.parse(value)), {
            message: "Invalid start time format",
        }),
        endTime: z.string().refine((value) => !isNaN(Date.parse(value)), {
            message: "Invalid end time format",
        }),
    }),
});

export const getAllSessions = z.object({
    query: z.object({
        groupId: z.string().regex(/^\d+$/, "Group ID must be a number"),
        courseId: z.string().regex(/^\d+$/, "Course ID must be a number"),
    }),
});

export const updateSessionSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Session name is required").optional(),
        startTime: z.string().refine((value) => !isNaN(Date.parse(value)), {
            message: "Invalid start time format",
        }).optional(),
        endTime: z.string().refine((value) => !isNaN(Date.parse(value)), {
            message: "Invalid end time format",
        }).optional(),
    }),
});

export const sessionIdParamSchema = z.object({
    params: z.object({
        sessionId: z.string().regex(/^\d+$/, "ID must be a number"),
    }),
});