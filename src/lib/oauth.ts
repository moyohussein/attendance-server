import { google } from "@lucia-auth/oauth/providers";
import { initAuth } from "./auth";

export const initGoogleOAuth = (db: D1Database, env: Record<string, string>) => {
  const auth = initAuth(db, env);
  const googleAuth = google(auth, {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_REDIRECT_URI || `${env.PUBLIC_URL}/auth/google/callback`,
    scope: ["openid", "email", "profile"]
  });

  return {
    auth,
    googleAuth
  };
};