import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { MarkAttendanceSchema, GetAttendanceSchema } from "../dto/attendance.dto";

export const MarkAttendanceOpenAPI = createRoute({
  method: "post",
  path: "/mark",
  tags: ["Attendance"],
  summary: "Mark attendance for a student",
  description: "Records attendance for a student in a specific class",
  request: {
    body: {
      description: "Attendance details",
      required: true,
      content: {
        "application/json": {
          schema: MarkAttendanceSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Attendance marked successfully",
      content: {
        "application/json": {
          schema: z.object({
            id: z.string(),
          }),
        },
      },
    },
    400: {
      description: "Bad request",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    403: {
      description: "Forbidden - Insufficient permissions",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
  },
});

export const GetAttendanceByClassOpenAPI = createRoute({
  method: "get",
  path: "/class/{classId}",
  tags: ["Attendance"],
  summary: "Get attendance records for a class",
  description: "Retrieves attendance records for a specific class within a date range",
  request: {
    params: z.object({
      classId: z.string().describe("Class ID"),
    }),
    query: z.object({
      startDate: z.string().optional().describe("Start date in YYYY-MM-DD format"),
      endDate: z.string().optional().describe("End date in YYYY-MM-DD format"),
    }),
  },
  responses: {
    200: {
      description: "Attendance records retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            attendance: z.array(z.object({
              id: z.string(),
              studentId: z.string(),
              classId: z.string(),
              schoolId: z.string(),
              teacherId: z.string(),
              date: z.string(),
              status: z.enum(["present", "absent", "late"]),
              note: z.string().nullable(),
              createdAt: z.string().nullable(),
              updatedAt: z.string().nullable(),
            })),
          }),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    403: {
      description: "Forbidden - Insufficient permissions",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    404: {
      description: "Class not found",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
  },
});

export const GetAttendanceByStudentOpenAPI = createRoute({
  method: "get",
  path: "/student/{studentId}",
  tags: ["Attendance"],
  summary: "Get attendance records for a student",
  description: "Retrieves attendance records for a specific student within a date range",
  request: {
    params: z.object({
      studentId: z.string().describe("Student ID"),
    }),
    query: z.object({
      startDate: z.string().optional().describe("Start date in YYYY-MM-DD format"),
      endDate: z.string().optional().describe("End date in YYYY-MM-DD format"),
    }),
  },
  responses: {
    200: {
      description: "Attendance records retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            attendance: z.array(z.object({
              id: z.string(),
              studentId: z.string(),
              classId: z.string(),
              schoolId: z.string(),
              teacherId: z.string(),
              date: z.string(),
              status: z.enum(["present", "absent", "late"]),
              note: z.string().nullable(),
              createdAt: z.string().nullable(),
              updatedAt: z.string().nullable(),
            })),
          }),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    403: {
      description: "Forbidden - Insufficient permissions",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    404: {
      description: "Student not found",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
  },
});