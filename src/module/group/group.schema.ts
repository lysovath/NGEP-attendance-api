import { z } from "zod";

export const createGroupSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Group name is required"),
    }),
});

export const updateGroupSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a number"),
    }),
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
        trainerIds: z.array(z.number().int().positive()).min(0),
    }),
});

export const updateGroupTraineesSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a number"),
    }),
    body: z.object({
        traineeIds: z.array(z.number().int().positive()).min(0),
    }),
});

export const addGroupCourseSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "ID must be a number"),
    }),
    body: z.object({
        courseId: z.number().int().positive("Course ID must be a positive integer"),
    }),
});

export const deleteGroupCourseSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "Group ID must be a number"),
    }),
    body: z.object({
        courseId: z.number().int().positive("Course ID must be a positive integer"),
    }),
});

export const getGroupCoursesSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, "Group ID must be a number"),
    }),
});

