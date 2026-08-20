import { z } from "zod";

export const weeklyReportSchema = z.object({
    query: z.object({
        groupId: z.string().regex(/^\d+$/, "Group ID must be a number").optional(),
        courseId: z.string().regex(/^\d+$/, "Course ID must be a number").optional(),
    }),
});

export const exportWeeklyReportSchema = z.object({
    query: z.object({
        groupId: z.string().regex(/^\d+$/, "Group ID must be a number").optional(),
        courseId: z.string().regex(/^\d+$/, "Course ID must be a number").optional(),
        role: z.enum(["trainee", "trainer"]).optional(),
    }),
});
