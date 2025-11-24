import { createAuth } from "better-auth";
import { cloudflare } from "@better-auth/cloudflare";
import { DrizzleDB } from "../core/database/drizzle";
import { users, UserRole } from "./src/models";
import { and, eq } from "drizzle-orm";
import { v7 as uuid } from "uuid";

// This would be the custom configuration with callbacks
const createCustomAuth = (env: {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BASE_URL: string;
  JWT_SECRET: string;
}) => {
  return createAuth({
    database: cloudflare(env.DB),
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      }
    },
    secret: env.JWT_SECRET || "default_secret_for_development",
    baseURL: env.BASE_URL || "http://localhost:8787",
    emailAndPassword: {
      enabled: true,
    },
    hooks: {
      async afterUserCreated(user, options) {
        // When a user is created via OAuth, also create in our application schema
        const db = DrizzleDB.getInstance(env.DB);
        
        try {
          // Check if user already exists in our app schema
          const existingUser = await db._.session
            .select()
            .from(users)
            .where(eq(users.email, user.email))
            .get();
            
          if (!existingUser) {
            // Create user in our app schema
            await db._.session
              .insert(users)
              .values({
                id: user.id, // Use the same ID from Better Auth
                email: user.email,
                firstName: user.name?.split(' ')[0] || null,
                lastName: user.name?.split(' ').slice(1).join(' ') || null,
                role: UserRole.Teacher, // Default role
                googleId: user.id, // Store the Better Auth user ID as googleId
                createdAt: new Date(),
              });
          }
        } catch (error) {
          console.error("Error creating user in app schema:", error);
        }
      }
    }
  });
};

export { createCustomAuth };