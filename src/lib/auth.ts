import { lucia } from "lucia";
import { d1 } from "@lucia-auth/adapter-sqlite";
import { github, google } from "@lucia-auth/oauth/providers";
import { dev } from "process";

export const initAuth = (db: D1Database, env: Record<string, string>) => {
  const auth = lucia({
    adapter: d1(db),
    env: dev || env.NODE_ENV === "development" ? "DEV" : "PROD",
    experimental: {
      debugMode: true
    },
    getUserAttributes: (data) => {
      return {
        googleId: data.google_id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        schoolId: data.school_id
      };
    }
  });

  type Auth = typeof auth;
  return auth;
};

export type Auth = ReturnType<typeof initAuth>;