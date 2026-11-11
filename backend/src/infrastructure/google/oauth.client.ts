import env from '@/env.js';
import { google, Auth } from 'googleapis';

export const createGoogleOauth2Client = (): Auth.OAuth2Client =>
  new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI);

export const googleOauth2Client: Auth.OAuth2Client = createGoogleOauth2Client();
