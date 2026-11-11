import env from '@/env.js';
import type { Auth } from 'googleapis';
import { InvalidGoogleAccountError, UnverifiedGoogleAccountError } from './gmail.errors.js';

const scopes = ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/gmail.readonly'];

export class GmailOauthService {
  constructor(private oauth2Client: Auth.OAuth2Client) {}

  getAuthorizationUrl(state: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state,
      include_granted_scopes: true,
      prompt: 'consent',
    });
  }

  async exchangeCode(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  async getAccountIdentity(idToken: string) {
    const ticket = await this.oauth2Client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email) throw InvalidGoogleAccountError();

    if (!payload.email_verified) throw UnverifiedGoogleAccountError();

    return {
      providerAccountId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  }
}
