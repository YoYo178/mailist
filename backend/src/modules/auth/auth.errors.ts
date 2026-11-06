import { ApiError } from '@/lib/api.lib.js';

export const UnauthorizedUserError = (
  message: string = 'User is not authorized to perform this action',
) =>
  new ApiError({
    statusCode: 401, // Unauthorized
    message,
    data: null,
  });

export const InvalidLoginError = (message: string = 'Invalid login credentials') =>
  new ApiError({
    statusCode: 401, // Unauthorized
    message,
    data: null,
  });

export const UserExistsError = (message: string = 'An user already exists with this email') =>
  new ApiError({
    statusCode: 409, // Conflict
    message,
    data: null,
  });
