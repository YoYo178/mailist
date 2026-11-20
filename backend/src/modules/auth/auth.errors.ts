import { ApiError } from '@/lib/api.lib.js';
import { HttpStatus } from '@/lib/http.lib.js';

export const UnauthorizedUserError = (message?: string) =>
  new ApiError({
    statusCode: HttpStatus.UNAUTHORIZED,
    message: message ?? 'User is not authorized to perform this action',
  });

export const InvalidLoginError = (message?: string) =>
  new ApiError({
    statusCode: HttpStatus.UNAUTHORIZED,
    message: message ?? 'Invalid login credentials',
  });

export const UserExistsError = (message?: string) =>
  new ApiError({
    statusCode: HttpStatus.CONFLICT,
    message: message ?? 'An user already exists with this email',
  });
