import { z } from "zod";

export const createUserSchema = z.object({
    body: z.object({
        email: z.string().email(),
        name: z.string().min(1, "Name is required"),
        role: z.enum(["ADMIN", "TRAINER"]),
        studentId: z.string().optional(),
    }),
});

export const updateUserSchema = z.object({
    body: z.object({
        email: z.string().email().optional(),
        name: z.string().min(1, "Name is required").optional(),
        role: z.enum(["ADMIN", "TRAINER"]).optional(),
        studentId: z.string().optional(),
    }),
});

export const getUserSchema = z.object({
    query: z.object({
        role: z.enum(["ADMIN", "TRAINER"]).optional(),
        groupId: z.string().regex(/^\d+$/, "Group ID must be a number").optional(),
    }),
});

export const userIdParamSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a number"),
    }),
});
