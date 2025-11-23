import { z } from "zod";

export const CreateStudentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  classId: z.string().min(1, "Class ID is required"),
  parentEmail: z.string().email("Invalid parent email format").optional(),
  parentPhone: z.string().optional(),
});

export const UpdateStudentSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  classId: z.string().min(1, "Class ID is required").optional(),
  parentEmail: z.string().email("Invalid parent email format").optional(),
  parentPhone: z.string().optional(),
});

export type CreateStudentDto = z.infer<typeof CreateStudentSchema>;
export type UpdateStudentDto = z.infer<typeof UpdateStudentSchema>;