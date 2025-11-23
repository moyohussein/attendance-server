import { z } from "zod";

export const CreateSchoolSchema = z.object({
  name: z.string().min(1, "School name is required"),
  address: z.string().optional(),
});

export const UpdateSchoolSchema = z.object({
  name: z.string().min(1, "School name is required").optional(),
  address: z.string().optional(),
});

export type CreateSchoolDto = z.infer<typeof CreateSchoolSchema>;
export type UpdateSchoolDto = z.infer<typeof UpdateSchoolSchema>;