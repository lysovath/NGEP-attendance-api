import { z } from "zod";

const timeRefine = (value: string) => !isNaN(Date.parse(value));

const timeFields = z.object({
    startTime: z.string().refine(timeRefine, { message: "Invalid start time format" }),
    endTime: z.string().refine(timeRefine, { message: "Invalid end time format" }),
});

function validateSchedule(schedule: { startTime: string; endTime: string }, ctx: z.RefinementCtx) {
    const start = new Date(schedule.startTime);
    const end = new Date(schedule.endTime);

    if (start.getTime() >= end.getTime()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Start time must be before end time",
        });
    }

    const day = start.getUTCDay();
    if (day === 0 || day === 6) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Sessions cannot be scheduled on weekends (Saturday or Sunday)",
        });
    }
}

export const createSessionSchema = z.object({
    body: z
        .object({
            groupId: z.number().int().positive("Group ID must be a positive integer"),
            courseId: z.number().int().positive("Course ID must be a positive integer"),
            name: z.string().min(1, "Session name is required"),
            type: z.enum(["THEORY", "LAB"]).optional(),
            ...timeFields.shape,
        })
        .superRefine(validateSchedule),
});

export const getAllSessions = z.object({
    query: z.object({
        groupId: z.string().regex(/^\d+$/, "Group ID must be a number"),
        courseId: z.string().regex(/^\d+$/, "Course ID must be a number"),
    }),
});

export const updateSessionSchema = z.object({
    body: z
        .object({
            name: z.string().min(1, "Session name is required").optional(),
            type: z.enum(["THEORY", "LAB"]).optional(),
            startTime: z
                .string()
                .refine(timeRefine, { message: "Invalid start time format" })
                .optional(),
            endTime: z
                .string()
                .refine(timeRefine, { message: "Invalid end time format" })
                .optional(),
        })
        .superRefine((data, ctx) => {
            if (data.startTime && data.endTime) {
                validateSchedule({ startTime: data.startTime, endTime: data.endTime }, ctx);
            }
        }),
});

export const sessionIdParamSchema = z.object({
    params: z.object({
        sessionId: z.string().regex(/^\d+$/, "ID must be a number"),
    }),
});