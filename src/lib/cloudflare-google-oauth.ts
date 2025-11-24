import {
  authorizationCodeGrantRequest,
  type Client,
  processAuthorizationCodeOpenIDResponse,
  validateAuthResponse
} from "oauth4webapi";

// This is a simplified Cloudflare-compatible Google OAuth implementation
// It follows the OAuth 2.0 specification and works in edge environments

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

interface GoogleUserResponse {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export class CloudflareGoogleOAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  public getAuthorizationUrl(state?: string, nonce?: string): URL {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");

    url.searchParams.set("client_id", this.clientId);
    url.searchParams.set("redirect_uri", this.redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");

    if (state) {
      url.searchParams.set("state", state);
    }

    if (nonce) {
      url.searchParams.set("nonce", nonce);
    }

    return url;
  }

  public async validateAndExchangeCode(code: string, expectedState?: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    idToken?: string;
    expiresIn?: number;
    user: GoogleUserResponse;
  }> {
    // First, exchange the code for tokens
    const tokenUrl = "https://oauth2.googleapis.com/token";

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
    }

    const tokenData = await response.json() as GoogleTokenResponse;
    const accessToken = tokenData.access_token;

    // Fetch user info from Google using the access token
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error(`User info request failed: ${userInfoResponse.status} ${userInfoResponse.statusText}`);
    }

    const userInfo = await userInfoResponse.json() as GoogleUserResponse;

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      idToken: tokenData.id_token,
      expiresIn: tokenData.expires_in,
      user: userInfo
    };
  }
}