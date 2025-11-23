import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { CreateClassSchema, UpdateClassSchema } from "../dto/class.dto";

export const CreateClassOpenAPI = createRoute({
  method: "post",
  path: "/",
  tags: ["Classes"],
  summary: "Create a new class",
  description: "Creates a new class in the school. Only school owners or teachers can create classes.",
  request: {
    body: {
      description: "Class details",
      required: true,
      content: {
        "application/json": {
          schema: CreateClassSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Class created successfully",
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

export const GetClassesOpenAPI = createRoute({
  method: "get",
  path: "/",
  tags: ["Classes"],
  summary: "Get classes for a school",
  description: "Retrieves all classes associated with a specific school",
  responses: {
    200: {
      description: "Classes retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            classes: z.array(z.object({
              id: z.string(),
              name: z.string(),
              schoolId: z.string(),
              teacherId: z.string().nullable(),
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

export const GetClassByIdOpenAPI = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Classes"],
  summary: "Get class details",
  description: "Retrieves details of a specific class by ID",
  request: {
    params: z.object({
      id: z.string().describe("Class ID"),
    }),
  },
  responses: {
    200: {
      description: "Class details retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            class: z.object({
              id: z.string(),
              name: z.string(),
              schoolId: z.string(),
              teacherId: z.string().nullable(),
              createdAt: z.string().nullable(),
              updatedAt: z.string().nullable(),
            }),
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

export const UpdateClassOpenAPI = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Classes"],
  summary: "Update class details",
  description: "Updates details of an existing class",
  request: {
    params: z.object({
      id: z.string().describe("Class ID"),
    }),
    body: {
      description: "Updated class details",
      required: true,
      content: {
        "application/json": {
          schema: UpdateClassSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Class updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            class: z.object({
              id: z.string(),
              name: z.string(),
              schoolId: z.string(),
              teacherId: z.string().nullable(),
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

export const DeleteClassOpenAPI = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Classes"],
  summary: "Delete a class",
  description: "Deletes a class and its related data",
  request: {
    params: z.object({
      id: z.string().describe("Class ID"),
    }),
  },
  responses: {
    200: {
      description: "Class deleted successfully",
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