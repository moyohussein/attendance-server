import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { CreateSchoolSchema, UpdateSchoolSchema } from "../dto/school.dto";

export const CreateSchoolOpenAPI = createRoute({
  method: "post",
  path: "/",
  tags: ["Schools"],
  summary: "Create a new school",
  description: "Creates a new school with the provided details. Only school owners can create schools.",
  request: {
    body: {
      description: "School details",
      required: true,
      content: {
        "application/json": {
          schema: CreateSchoolSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "School created successfully",
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
  },
});

export const GetSchoolOpenAPI = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Schools"],
  summary: "Get school details",
  description: "Retrieves details of a specific school by ID",
  request: {
    params: z.object({
      id: z.string().describe("School ID"),
    }),
  },
  responses: {
    200: {
      description: "School details retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            school: z.object({
              id: z.string(),
              name: z.string(),
              ownerId: z.string(),
              address: z.string().nullable(),
              createdAt: z.string().nullable(),
              updatedAt: z.string().nullable(),
            }),
          }),
        },
      },
    },
    404: {
      description: "School not found",
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

export const UpdateSchoolOpenAPI = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Schools"],
  summary: "Update school details",
  description: "Updates details of an existing school",
  request: {
    params: z.object({
      id: z.string().describe("School ID"),
    }),
    body: {
      description: "Updated school details",
      required: true,
      content: {
        "application/json": {
          schema: UpdateSchoolSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "School updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            school: z.object({
              id: z.string(),
              name: z.string(),
              ownerId: z.string(),
              address: z.string().nullable(),
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
      description: "School not found",
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