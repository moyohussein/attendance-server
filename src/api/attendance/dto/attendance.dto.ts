import { z } from "zod";

export const MarkAttendanceSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  classId: z.string().min(1, "Class ID is required"),
  date: z.string().datetime({ message: "Date must be in ISO 8601 format" }).optional(), // defaults to today
  status: z.enum(["present", "absent", "late"], { 
    required_error: "Status is required",
    invalid_type_error: "Status must be present, absent, or late"
  }),
  note: z.string().optional(),
});

export const GetAttendanceSchema = z.object({
  classId: z.string().optional(),
  studentId: z.string().optional(),
  date: z.string().optional(), // Date in ISO format
  startDate: z.string().optional(), // For date range queries
  endDate: z.string().optional(), // For date range queries
});

export type MarkAttendanceDto = z.infer<typeof MarkAttendanceSchema>;
export type GetAttendanceDto = z.infer<typeof GetAttendanceSchema>;