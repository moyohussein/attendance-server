import { createRoute, z } from "@hono/zod-openapi";
import {
    RegisterSchoolOwnerBody,
    SignupResponseBadRequest,
    SignupResponseSuccess,
} from "../dto";

export const RegisterSchoolOwnerOpenAPI = createRoute({
    method: "post",
    tags: ["Users"],
    operationId: "registerSchoolOwner",
    summary: "Register a new school owner",
    description: "Registers a new school owner and their school.",
    path: "/register-school-owner",
    request: {
        body: { content: { "application/json": { schema: RegisterSchoolOwnerBody } } },
    },
    responses: {
        201: {
            description: "Success",
            content: { "application/json": { schema: SignupResponseSuccess } },
        },
        400: {
            description: "Bad request",
            content: { "application/json": { schema: SignupResponseBadRequest } },
        },
        500: {
            description: "Internal Server Error",
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
