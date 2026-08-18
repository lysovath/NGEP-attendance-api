import { z } from "zod";

export const createTrainerAttendanceSchema = z.object({
    params: z.object({
        sessionId: z.string().regex(/^\d+$/, "ID must be a number"),
    }),
    body: z.object({
        trainerId: z.number().int().positive("Trainer ID must be a positive integer"),
        status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"], {
            error: "Invalid attendace status",
        }),
    }),
});

export const getTrainerBySessionIdSchema = z.object({
    params: z.object({
        sessionId: z.string().regex(/^\d+$/, "ID must be a number"),
    }),
});

export const batchCreateTrainerAttendanceSchema = z.object({
    params: z.object({
        sessionId: z.string().regex(/^\d+$/, "ID must be a number"),
    }),
    body: z.array(z.object({
        trainerId: z.number().int().positive("Trainer ID must be a positive integer"),
        status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"], {
            error: "Invalid attendace status",
        }),
    })).min(1, "At least one trainer attendance record is required"),
});

export const updateTrainerAttendanceSchema = z.object({
    params: z.object({
        sessionId: z.string().regex(/^\d+$/, "Session ID must be a number"),
        id: z.string().regex(/^\d+$/, "Trainer ID must be a number"),
    }),
    body: z.object({
        status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"], {
            error: "Invalid attendace status",
        }),
    }),
});
