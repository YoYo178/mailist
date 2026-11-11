import { ApiError } from '@/lib/api.lib.js';

export const GoogleAuthDeniedError = (message: string = 'Google authorization was denied.') =>
  new ApiError({
    data: null,
    message,
    statusCode: 403,
  });

export const InvalidOrExpiredState = (
  message: string = 'Invalid or expired OAuth state, please try logging in againē',
) =>
  new ApiError({
    data: null,
    message,
    statusCode: 400,
  });

export const InvalidGoogleAccountError = (
  message: string = 'Invalid google account, please try again with a different account.',
) =>
  new ApiError({
    data: null,
    message,
    statusCode: 400,
  });

export const UnverifiedGoogleAccountError = (
  message: string = 'Your google account is not verified, please verify your account and try again.',
) =>
  new ApiError({
    data: null,
    message,
    statusCode: 401,
  });
