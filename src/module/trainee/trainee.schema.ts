import { z } from "zod";

export const createTraineeSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Trainee name is required"),
        email: z.string().email("Invalid email format"),
        studentId: z.string().min(1, "Student ID is required").optional(),
        groupId: z.number().int().positive().optional(),
    }),
});

export const importTraineesSchema = z.object({
    body: z.object({
        groupId: z.number().int().positive().optional(),
        trainees: z.array(z.object({
            name: z.string().min(1, "Trainee name is required"),
            email: z.string().email("Invalid email format"),
            studentId: z.string().optional(),
        })).min(1, "At least one trainee is required"),
    }),
});

export const updateTraineeSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Trainee name is required").optional(),
        email: z.string().email("Invalid email format").optional(),
        studentId: z.string().min(1, "Student ID is required").optional(),
    }),
});

export const traineeIdParamSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a number"),
    }),
});

export const getTraineeSchema = z.object({
    query: z.object({
        groupId: z.string().regex(/^\d+$/, "Group ID must be a number").optional(),
    }),
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a number"),
    }),
});