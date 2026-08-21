import { z } from "zod";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const listEnrollmentsSchema = z.object({
    query: z.object({
        date: dateString,
        groupId: z.string().regex(/^\d+$/, "Group ID must be a number").optional(),
    }),
});

export const rosterSchema = z.object({
    query: z.object({
        date: dateString,
        groupId: z.string().regex(/^\d+$/, "Group ID must be a number"),
    }),
});

export const bulkAssignSchema = z.object({
    body: z.object({
        groupId: z.number().int().positive("Group ID must be a positive integer"),
        date: dateString,
        traineeIds: z.array(z.number().int().positive()).min(1, "At least one trainee is required"),
    }),
});

export const removeAssignmentsSchema = z.object({
    body: z.object({
        date: dateString,
        groupId: z.number().int().positive("Group ID must be a positive integer").optional(),
        traineeIds: z.array(z.number().int().positive()).min(1, "At least one trainee is required"),
    }),
});

export const resetDaySchema = z.object({
    body: z.object({
        date: dateString,
        groupId: z.number().int().positive("Group ID must be a positive integer").optional(),
    }),
});

export const copyDaySchema = z.object({
    body: z.object({
        fromDate: dateString,
        toDate: dateString,
    }),
});
