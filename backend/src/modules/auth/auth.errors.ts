import { ApiError } from '@/lib/api.lib.js';

export const UnauthorizedUserError = (message?: string) =>
  new ApiError({
    statusCode: 401, // Unauthorized
    message: message ?? 'User is not authorized to perform this action',
  });

export const InvalidLoginError = (message?: string) =>
  new ApiError({
    statusCode: 401, // Unauthorized
    message: message ?? 'Invalid login credentials',
  });

export const UserExistsError = (message?: string) =>
  new ApiError({
    statusCode: 409, // Conflict
    message: message ?? 'An user already exists with this email',
  });
