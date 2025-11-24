import { betterAuth } from "better-auth";
import { cloudflare } from "@better-auth/cloudflare";

export const createAuth = (env: {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BASE_URL: string;
}) => {
  return betterAuth({
    database: cloudflare(env.DB),
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        redirectUri: `${env.BASE_URL}/auth/google/callback`,
      }
    },
    baseURL: env.BASE_URL,
    secret: env.JWT_SECRET || "default_secret_for_development",
    // Define how to retrieve user info for API requests
    emailAndPassword: {
      enabled: true,
    },
  });
};