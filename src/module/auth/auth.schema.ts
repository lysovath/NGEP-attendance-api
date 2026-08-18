import { z } from "zod";

export const verifyEmailSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
    }),
});