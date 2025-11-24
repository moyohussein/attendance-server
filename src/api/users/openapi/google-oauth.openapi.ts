import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

export const GoogleOAuthRoute = createRoute({
  method: "get",
  path: "/google",
  summary: "Initiate Google OAuth flow",
  description: "Redirects to Google's OAuth consent screen to authenticate user",
  request: {
    query: z.object({
      redirect_uri: z.string().url().optional().describe("Where to redirect after authentication"),
    }),
  },
  responses: {
    302: {
      description: "Redirect to Google OAuth consent screen",
    },
  },
});

export const GoogleOAuthCallbackRoute = createRoute({
  method: "get",
  path: "/google/callback",
  summary: "Handle Google OAuth callback",
  description: "Handles the callback from Google OAuth and creates/updates user",
  request: {
    query: z.object({
      code: z.string().describe("Authorization code from Google"),
      state: z.string().optional().describe("State parameter for CSRF protection"),
    }),
  },
  responses: {
    302: {
      description: "Redirects to frontend with JWT token",
    },
    400: {
      description: "Bad request - missing code or invalid state",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string().openapi({ examples: ["Missing authorization code"] }),
          }),
        },
      },
    },
    401: {
      description: "Unauthorized - invalid authorization code",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string().openapi({ examples: ["Invalid authorization code"] }),
          }),
        },
      },
    },
  },
});

export const GoogleLoginRoute = createRoute({
  method: "post",
  path: "/google/login",
  summary: "Alternative Google OAuth endpoint for SPAs",
  description: "Exchanges Google authorization code for JWT token directly (for single-page applications)",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.string().describe("Authorization code from Google"),
            state: z.string().optional().describe("State parameter for CSRF protection"),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Authentication successful",
      content: {
        "application/json": {
          schema: z.object({
            token: z.string().openapi({ example: "jwt_token_example" }),
            user: z.object({
              id: z.string().openapi({ example: "uuid_example" }),
              email: z.string().email().openapi({ example: "user@example.com" }),
              firstName: z.string().nullable().openapi({ example: "John" }),
              lastName: z.string().nullable().openapi({ example: "Doe" }),
              role: z.enum(["super_admin", "school_owner", "teacher"]).openapi({ example: "teacher" }),
              schoolId: z.string().nullable().openapi({ example: "school_uuid" }),
              googleId: z.string().nullable().openapi({ example: "google_user_id" }),
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
            message: z.string().openapi({ examples: ["Invalid request"] }),
          }),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string().openapi({ examples: ["Invalid authorization code"] }),
          }),
        },
      },
    },
  },
});