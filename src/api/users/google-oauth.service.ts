import { and, eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { sign } from "hono/jwt";
import { v7 as uuid } from "uuid";
import { users, UserRole } from "../../models";
import { CloudflareGoogleOAuth } from "../../lib/cloudflare-google-oauth";

export class GoogleOAuthService {
  private googleOAuth: CloudflareGoogleOAuth;

  constructor(
    private readonly db: DrizzleD1Database<Record<string, never>>,
    private readonly jwtSecret: string,
    googleClientId: string,
    googleClientSecret: string,
    redirectUri: string
  ) {
    this.googleOAuth = new CloudflareGoogleOAuth(
      googleClientId,
      googleClientSecret,
      redirectUri
    );
  }

  public static getInstance(
    db: DrizzleD1Database<Record<string, never>>,
    jwtSecret: string,
    googleClientId: string,
    googleClientSecret: string,
    redirectUri: string
  ) {
    return new GoogleOAuthService(db, jwtSecret, googleClientId, googleClientSecret, redirectUri);
  }

  public getAuthUrl(state?: string): string {
    return this.googleOAuth.getAuthorizationUrl(state).toString();
  }

  public async authenticate(code: string, expectedState?: string) {
    try {
      const result = await this.googleOAuth.validateAndExchangeCode(code, expectedState);

      // Check if user already exists by Google ID
      let user = await this.db
        .select()
        .from(users)
        .where(eq(users.googleId, result.user.id))
        .get();

      if (user) {
        // If user exists, return existing user
        const token = await sign({ id: user.id, role: user.role, schoolId: user.schoolId }, this.jwtSecret);
        return {
          token,
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
          .where(eq(users.email, result.user.email))
          .get();

        if (user) {
          // Update existing user with Google ID
          user = await this.db
            .update(users)
            .set({
              googleId: result.user.id,
              firstName: user.firstName || result.user.given_name,
              lastName: user.lastName || result.user.family_name
            })
            .where(eq(users.id, user.id))
            .returning()
            .get();

          const token = await sign({ id: user.id, role: user.role, schoolId: user.schoolId }, this.jwtSecret);
          return {
            token,
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
              email: result.user.email,
              firstName: result.user.given_name,
              lastName: result.user.family_name,
              role: UserRole.Teacher, // Default to Teacher for Google signups
              googleId: result.user.id,
              createdAt: new Date(),
            })
            .returning()
            .get();

          const token = await sign({ id: user.id, role: user.role, schoolId: user.schoolId }, this.jwtSecret);
          return {
            token,
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
    } catch (error) {
      console.error("Google OAuth error:", error);
      throw new Error("Google authentication failed");
    }
  }
}