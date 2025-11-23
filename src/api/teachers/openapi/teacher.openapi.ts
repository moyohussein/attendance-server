import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { InviteTeacherSchema, AcceptInvitationSchema } from "../dto/teacher.dto";

export const InviteTeacherOpenAPI = createRoute({
  method: "post",
  path: "/invite",
  tags: ["Teachers"],
  summary: "Invite a new teacher",
  description: "Invites a new teacher to join the school. Creates an invitation token.",
  request: {
    body: {
      description: "Teacher invitation details",
      required: true,
      content: {
        "application/json": {
          schema: InviteTeacherSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Teacher invited successfully",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
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

export const AcceptInvitationOpenAPI = createRoute({
  method: "post",
  path: "/accept-invite",
  tags: ["Teachers"],
  summary: "Accept teacher invitation",
  description: "Accepts an invitation to join a school as a teacher",
  request: {
    body: {
      description: "Invitation token and password",
      required: true,
      content: {
        "application/json": {
          schema: AcceptInvitationSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Invitation accepted successfully",
      content: {
        "application/json": {
          schema: z.object({
            token: z.string(),
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
      description: "Invitation not found or expired",
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

export const GetTeachersOpenAPI = createRoute({
  method: "get",
  path: "/",
  tags: ["Teachers"],
  summary: "Get teachers for a school",
  description: "Retrieves all teachers associated with a specific school",
  responses: {
    200: {
      description: "Teachers retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            teachers: z.array(z.object({
              id: z.string(),
              firstName: z.string(),
              lastName: z.string(),
              email: z.string(),
              schoolId: z.string(),
              createdAt: z.string().nullable(),
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