import { ApiError } from '@/lib/api.lib.js';
import { HttpStatus } from '@/lib/http.lib.js';

export const GoogleAuthDeniedError = (message?: string) =>
  new ApiError({
    message: message ?? 'Google authorization was denied.',
    statusCode: HttpStatus.FORBIDDEN,
  });

export const InvalidOrExpiredState = (message?: string) =>
  new ApiError({
    message: message ?? 'Invalid or expired OAuth state. Please try connecting again.',
    statusCode: HttpStatus.BAD_REQUEST,
  });

export const InvalidGoogleAccountError = (message?: string) =>
  new ApiError({
    message: message ?? 'Unable to verify the Google account.',
    statusCode: HttpStatus.BAD_REQUEST,
  });

export const UnverifiedGoogleAccountError = (message?: string) =>
  new ApiError({
    message: message ?? 'Your Google account email is not verified.',
    statusCode: HttpStatus.FORBIDDEN,
  });

export const GmailAccountNotFoundError = (message?: string) =>
  new ApiError({
    message: message ?? 'Connected Gmail account not found.',
    statusCode: HttpStatus.NOT_FOUND,
  });

export const GmailReauthorizationRequiredError = (message?: string) =>
  new ApiError({
    message: message ?? 'Gmail authorization has expired. Please reconnect your account.',
    statusCode: HttpStatus.CONFLICT,
  });

export const GmailTokenRefreshFailedError = (message?: string) =>
  new ApiError({
    message: message ?? 'Unable to refresh Gmail credentials. Please try again.',
    statusCode: HttpStatus.BAD_GATEWAY,
  });
