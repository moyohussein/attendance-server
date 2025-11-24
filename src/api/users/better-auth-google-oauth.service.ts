import { and, eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { v7 as uuid } from "uuid";
import { users, UserRole } from "../models";

export class BetterAuthGoogleOAuthService {
  constructor(
    private readonly db: DrizzleD1Database<Record<string, never>>,
  ) { }

  public static getInstance(
    db: DrizzleD1Database<Record<string, never>>,
  ) {
    return new BetterAuthGoogleOAuthService(db);
  }

  public async handleCallback(
    googleUser: {
      id: string;
      email: string;
      verified_email: boolean;
      name: string;
      given_name: string;
      family_name: string;
      picture: string;
      locale: string;
    },
    env: {
      DB: D1Database;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      BASE_URL: string;
    }
  ) {
    // Check if user already exists in our system by Google ID
    let user = await this.db
      .select()
      .from(users)
      .where(eq(users.googleId, googleUser.id))
      .get();

    if (user) {
      // If user exists, return existing user
      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          schoolId: user.schoolId,
          googleId: user.googleId,
        }
      };
    } else {
      // Check if user exists with email (but no Google ID) - link accounts
      user = await this.db
        .select()
        .from(users)
        .where(eq(users.email, googleUser.email))
        .get();

      if (user) {
        // Update existing user with Google ID
        user = await this.db
          .update(users)
          .set({ 
            googleId: googleUser.id,
            firstName: user.firstName || googleUser.given_name,
            lastName: user.lastName || googleUser.family_name 
          })
          .where(eq(users.id, user.id))
          .returning()
          .get();

        return {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            schoolId: user.schoolId,
            googleId: user.googleId,
          }
        };
      } else {
        // Create new user with Google authentication
        user = await this.db
          .insert(users)
          .values({
            id: uuid(),
            email: googleUser.email,
            firstName: googleUser.given_name,
            lastName: googleUser.family_name,
            role: UserRole.Teacher, // Default to Teacher for Google signups
            googleId: googleUser.id,
            createdAt: new Date(),
          })
          .returning()
          .get();

        return {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            schoolId: user.schoolId,
            googleId: user.googleId,
          }
        };
      }
    }
  }
}