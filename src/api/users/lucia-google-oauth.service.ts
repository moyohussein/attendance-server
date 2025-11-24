import { and, eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { OAuthRequestError } from "lucia";
import { initGoogleOAuth } from "./oauth";
import { users, UserRole } from "../models";
import { v7 as uuid } from "uuid";
import { authUser, userKey } from "./lucia-schema";

export class LuciaGoogleOAuthService {
  constructor(
    private readonly db: DrizzleD1Database<Record<string, never>>,
  ) { }

  public static getInstance(
    db: DrizzleD1Database<Record<string, never>>,
  ) {
    return new LuciaGoogleOAuthService(db);
  }

  public getAuthUrl(env: Record<string, string>, state?: string): string {
    const { googleAuth } = initGoogleOAuth(this.db._.session, env);
    
    // Lucia's googleAuth.authorize() returns a Promise
    // This needs to be handled in the route directly, not in the service
    // So we'll return the Google OAuth URL generation function
    throw new Error("This method should be implemented in the route handler since it's async");
  }

  public async handleCallback(
    code: string,
    state: string | null,
    env: Record<string, string>
  ) {
    try {
      const { auth, googleAuth } = initGoogleOAuth(this.db._.session, env);
      
      // Validate the callback
      const { getExistingUser, googleUser, createUser } = await googleAuth.validateCallback(code);

      // Check if user already exists in our system via Lucia
      const existingUser = await getExistingUser();
      
      if (existingUser) {
        // User already exists, create session
        const session = await auth.createSession({
          userId: existingUser.userId,
          attributes: {}
        });
        
        const authRequest = auth.handleRequest({ headers: new Headers() }, session);
        const luciaSession = authRequest.session;
        
        return {
          token: luciaSession?.sessionId || "",
          user: existingUser.user
        };
      } else {
        // Create new user in both Lucia and our application
        const newUser = await createUser({
          providerUserId: googleUser.id,
          attributes: {
            email: googleUser.email,
            firstName: googleUser.firstName,
            lastName: googleUser.lastName,
            google_id: googleUser.id
          }
        });

        // Also create user in our application schema for consistency
        // Check if user with same email already exists in our app
        const appUser = await this.db
          .select()
          .from(users)
          .where(eq(users.email, googleUser.email))
          .get();

        let appUserId = newUser.userId;
        
        if (!appUser) {
          // Create user in our application schema
          const createdUser = await this.db
            .insert(users)
            .values({
              id: newUser.userId,
              email: googleUser.email,
              firstName: googleUser.firstName || null,
              lastName: googleUser.lastName || null,
              role: UserRole.Teacher, // Default role for Google signups
              googleId: googleUser.id,
              createdAt: new Date()
            })
            .returning({ id: users.id })
            .get();
            
          appUserId = createdUser.id;
        } else {
          // Update existing user with Google ID
          await this.db
            .update(users)
            .set({ googleId: googleUser.id })
            .where(eq(users.id, appUser.id));
            
          appUserId = appUser.id;
        }

        // Create session
        const session = await auth.createSession({
          userId: newUser.userId,
          attributes: {}
        });

        return {
          token: session.sessionId,
          user: {
            id: appUserId,
            email: googleUser.email,
            firstName: googleUser.firstName,
            lastName: googleUser.lastName,
            role: UserRole.Teacher,
            schoolId: null,
            googleId: googleUser.id
          }
        };
      }
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      if (error instanceof OAuthRequestError) {
        // valid google redirect_uri issues will be caught here
        throw error;
      }
      throw new Error("Google authentication failed");
    }
  }
}