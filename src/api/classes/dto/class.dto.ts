import { z } from "zod";

export const CreateClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  teacherId: z.string().optional(), // Optional - class might not have assigned teacher initially
});

export const UpdateClassSchema = z.object({
  name: z.string().min(1, "Class name is required").optional(),
  teacherId: z.string().optional(),
});

export type CreateClassDto = z.infer<typeof CreateClassSchema>;
export type UpdateClassDto = z.infer<typeof UpdateClassSchema>;