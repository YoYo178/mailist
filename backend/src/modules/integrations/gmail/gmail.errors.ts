import { ApiError } from '@/lib/api.lib.js';

export const GoogleAuthDeniedError = (
  message = 'Google authorization was denied.',
) =>
  new ApiError({
    data: null,
    message,
    statusCode: 403,
  });

export const InvalidOrExpiredState = (
  message = 'Invalid or expired OAuth state. Please try connecting again.',
) =>
  new ApiError({
    data: null,
    message,
    statusCode: 400,
  });

export const InvalidGoogleAccountError = (
  message = 'Unable to verify the Google account.',
) =>
  new ApiError({
    data: null,
    message,
    statusCode: 400,
  });

export const UnverifiedGoogleAccountError = (
  message = 'Your Google account email is not verified.',
) =>
  new ApiError({
    data: null,
    message,
    statusCode: 403,
  });

export const GmailAccountNotFoundError = (
  message = 'Connected Gmail account not found.',
) =>
  new ApiError({
    data: null,
    message,
    statusCode: 404,
  });

export const GmailReauthorizationRequiredError = (
  message = 'Gmail authorization has expired. Please reconnect your account.',
) =>
  new ApiError({
    data: null,
    message,
    statusCode: 409,
  });

export const GmailTokenRefreshFailedError = (
  message = 'Unable to refresh Gmail credentials. Please try again.',
) =>
  new ApiError({
    data: null,
    message,
    statusCode: 502,
  });
