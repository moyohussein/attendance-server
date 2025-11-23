import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";

export const GetSchoolAnalyticsOpenAPI = createRoute({
    method: "get",
    path: "/school",
    tags: ["Analytics"],
    summary: "Get school analytics",
    description: "Retrieves attendance statistics for the entire school",
    request: {
        query: z.object({
            startDate: z.string().optional().describe("Start date in YYYY-MM-DD format"),
            endDate: z.string().optional().describe("End date in YYYY-MM-DD format"),
        }),
    },
    responses: {
        200: {
            description: "School analytics retrieved successfully",
            content: {
                "application/json": {
                    schema: z.object({
                        stats: z.any(), // Using any for now as the stats structure might be complex
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
            description: "Forbidden",
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

export const GetClassAnalyticsOpenAPI = createRoute({
    method: "get",
    path: "/class/{classId}",
    tags: ["Analytics"],
    summary: "Get class analytics",
    description: "Retrieves attendance statistics for a specific class",
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
            description: "Class analytics retrieved successfully",
            content: {
                "application/json": {
                    schema: z.object({
                        stats: z.any(),
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
            description: "Forbidden",
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

export const GetStudentAnalyticsOpenAPI = createRoute({
    method: "get",
    path: "/student/{studentId}",
    tags: ["Analytics"],
    summary: "Get student analytics",
    description: "Retrieves attendance statistics for a specific student",
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
            description: "Student analytics retrieved successfully",
            content: {
                "application/json": {
                    schema: z.object({
                        stats: z.any(),
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
            description: "Forbidden",
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
