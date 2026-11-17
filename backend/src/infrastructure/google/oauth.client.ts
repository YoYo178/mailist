import env from '@/env.js';
import { Auth, google } from 'googleapis';

export const createGoogleOauth2Client = (): Auth.OAuth2Client =>
  new google.auth.OAuth2({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_REDIRECT_URI,
  });

export const googleOauth2Client: Auth.OAuth2Client = createGoogleOauth2Client();
