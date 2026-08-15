import { z } from "zod";

export const createGroupSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Group name is required"),
    }),
});

export const updateGroupSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Group name is required").optional(),
    }),
});

export const groupIdParamSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a number"),
    }),
});

export const updateGroupTrainersSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a number"),
    }),
    body: z.object({
        trainerIds: z.array(z.number().int().positive()).min(1, "At least one trainer ID is required"),
    }),
});

export const updateGroupTraineesSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a number"),
    }),
    body: z.object({
        traineeIds: z.array(z.number().int().positive()).min(1, "At least one trainee ID is required"),
    }),
});

