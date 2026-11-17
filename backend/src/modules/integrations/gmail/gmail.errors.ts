import { ApiError } from '@/lib/api.lib.js';

export const GoogleAuthDeniedError = (message?: string) =>
  new ApiError({
    message: message ?? 'Google authorization was denied.',
    statusCode: 403,
  });

export const InvalidOrExpiredState = (message?: string) =>
  new ApiError({
    message: message ?? 'Invalid or expired OAuth state. Please try connecting again.',
    statusCode: 400,
  });

export const InvalidGoogleAccountError = (message?: string) =>
  new ApiError({
    message: message ?? 'Unable to verify the Google account.',
    statusCode: 400,
  });

export const UnverifiedGoogleAccountError = (message?: string) =>
  new ApiError({
    message: message ?? 'Your Google account email is not verified.',
    statusCode: 403,
  });

export const GmailAccountNotFoundError = (message?: string) =>
  new ApiError({
    message: message ?? 'Connected Gmail account not found.',
    statusCode: 404,
  });

export const GmailReauthorizationRequiredError = (message?: string) =>
  new ApiError({
    message: message ?? 'Gmail authorization has expired. Please reconnect your account.',
    statusCode: 409,
  });

export const GmailTokenRefreshFailedError = (message?: string) =>
  new ApiError({
    message: message ?? 'Unable to refresh Gmail credentials. Please try again.',
    statusCode: 502,
  });
