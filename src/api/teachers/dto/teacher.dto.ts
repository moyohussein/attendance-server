import { z } from "zod";

export const CreateTeacherSchema = z.object({
  email: z.string().email("Invalid email format"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const InviteTeacherSchema = z.object({
  email: z.string().email("Invalid email format"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const AcceptInvitationSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type CreateTeacherDto = z.infer<typeof CreateTeacherSchema>;
export type InviteTeacherDto = z.infer<typeof InviteTeacherSchema>;
export type AcceptInvitationDto = z.infer<typeof AcceptInvitationSchema>;