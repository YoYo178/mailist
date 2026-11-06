import { ApiError } from '@/lib/api.lib.js';
import { getProcessedErrors } from '@/lib/zod.lib.js';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

async function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  // Handle validation errors
  if (err instanceof ZodError) {
    console.error('[Validation] An error occured: ', err);

    res.status(400).json({
      success: false,
      message: 'Invalid input data',
      data: null,
      errors: getProcessedErrors(err),
    });
    return;
  }

  // Handle custom application errors
  if (err instanceof ApiError) {
    console.error('[App] An error occured: ', err);

    res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      data: err.data,
      errors: err.errors,
    });
    return;
  }

  // Handle other uncaught errors
  console.error('[Uncaught] An error occured: ', err);

  res.status(500).json({
    success: false,
    message: 'Something went wrong, please try again later',
    data: null,
    errors: {},
  });
}

export default errorHandler;
