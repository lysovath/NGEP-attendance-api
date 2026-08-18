import { z } from "zod";

export const batchCreateTraineeAttendanceSchema = z.object({
    params: z.object({
        sessionId: z.string().regex(/^\d+$/, "ID must be a number"),
    }),
    body: z.array(z.object({
        traineeId: z.number().int().positive("Trainee ID must be a positive integer"),
        status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"], {
            error: "Invalid attendace status",
        }),
    })).min(1, "At least one trainee attendance record is required"),
});

export const getTraineeBySessionIdSchema = z.object({
    params: z.object({
        sessionId: z.string().regex(/^\d+$/, "ID must be a number"),
    }),
});