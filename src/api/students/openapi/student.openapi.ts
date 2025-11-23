import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { CreateStudentSchema, UpdateStudentSchema } from "../dto/student.dto";

export const CreateStudentOpenAPI = createRoute({
  method: "post",
  path: "/",
  tags: ["Students"],
  summary: "Create a new student",
  description: "Creates a new student in the school. Only school owners or teachers can create students.",
  request: {
    body: {
      description: "Student details",
      required: true,
      content: {
        "application/json": {
          schema: CreateStudentSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Student created successfully",
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

export const GetStudentsOpenAPI = createRoute({
  method: "get",
  path: "/",
  tags: ["Students"],
  summary: "Get students for a school or class",
  description: "Retrieves all students associated with a specific school or class",
  responses: {
    200: {
      description: "Students retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            students: z.array(z.object({
              id: z.string(),
              firstName: z.string(),
              lastName: z.string(),
              classId: z.string(),
              schoolId: z.string(),
              parentEmail: z.string().nullable(),
              parentPhone: z.string().nullable(),
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
  },
});

export const GetStudentByIdOpenAPI = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Students"],
  summary: "Get student details",
  description: "Retrieves details of a specific student by ID",
  request: {
    params: z.object({
      id: z.string().describe("Student ID"),
    }),
  },
  responses: {
    200: {
      description: "Student details retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            student: z.object({
              id: z.string(),
              firstName: z.string(),
              lastName: z.string(),
              classId: z.string(),
              schoolId: z.string(),
              parentEmail: z.string().nullable(),
              parentPhone: z.string().nullable(),
              createdAt: z.string().nullable(),
              updatedAt: z.string().nullable(),
            }),
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

export const UpdateStudentOpenAPI = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Students"],
  summary: "Update student details",
  description: "Updates details of an existing student",
  request: {
    params: z.object({
      id: z.string().describe("Student ID"),
    }),
    body: {
      description: "Updated student details",
      required: true,
      content: {
        "application/json": {
          schema: UpdateStudentSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Student updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            student: z.object({
              id: z.string(),
              firstName: z.string(),
              lastName: z.string(),
              classId: z.string(),
              schoolId: z.string(),
              parentEmail: z.string().nullable(),
              parentPhone: z.string().nullable(),
              createdAt: z.string().nullable(),
              updatedAt: z.string().nullable(),
            }),
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

export const DeleteStudentOpenAPI = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Students"],
  summary: "Delete a student",
  description: "Deletes a student and their related data",
  request: {
    params: z.object({
      id: z.string().describe("Student ID"),
    }),
  },
  responses: {
    200: {
      description: "Student deleted successfully",
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