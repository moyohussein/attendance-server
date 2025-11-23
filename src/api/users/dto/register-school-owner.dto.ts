import { z } from "@hono/zod-openapi";

export const RegisterSchoolOwnerBody = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    schoolName: z.string().min(1),
});
