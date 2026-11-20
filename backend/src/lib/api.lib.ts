import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { HttpStatus } from './http.lib.js';

const REDIRECT_STATUS_CODES = [
  HttpStatus.MOVED_PERMANENTLY, // 301
  HttpStatus.FOUND, // 302
  HttpStatus.SEE_OTHER, // 303
  HttpStatus.TEMPORARY_REDIRECT, // 307
  HttpStatus.PERMANENT_REDIRECT, // 308
] as const;

// API Error
interface IApiErrorParams<T> {
  statusCode: number;
  message: string;
  data?: T | null;
  errors?: Record<string, unknown>;
}

export class ApiError<T = null> extends Error {
  public statusCode: number;
  public data: T | null;
  public success: boolean;
  public errors: Record<string, unknown>;

  constructor({
    statusCode,
    message = 'Something went wrong',
    data = null,
    errors = {},
  }: IApiErrorParams<T>) {
    super(message);

    this.statusCode = statusCode;
    this.data = data;
    this.success = false;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

// API Response

interface IApiRedirectReponse {
  statusCode: (typeof REDIRECT_STATUS_CODES)[number];
  targetUrl: string;
}
function isRedirectResponse(result: TApiResponse): result is IApiRedirectReponse {
  return new Set<number>(REDIRECT_STATUS_CODES).has(result.statusCode);
}

interface IApiNoContentResponse {
  statusCode: typeof HttpStatus.NO_CONTENT;
}
function isNoContentResponse(result: TApiResponse): result is IApiNoContentResponse {
  return result.statusCode === HttpStatus.NO_CONTENT;
}

interface IApiSuccessResponse<T> {
  data: T;
  message: string;
  statusCode: number;
  success: true;
}

interface IApiFailResponse<T> {
  data: T;
  errors: Record<string, unknown>;
  message: string;
  statusCode: number;
  success: false;
}

export type TApiResponse<T = unknown> =
  | IApiSuccessResponse<T>
  | IApiFailResponse<T>
  | IApiNoContentResponse
  | IApiRedirectReponse;

type ControllerFn = (...args: Parameters<RequestHandler>) => TApiResponse | Promise<TApiResponse>;
export function routeWrapper(handlerFn: ControllerFn) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = await handlerFn(req, res, next);

    if (isNoContentResponse(result)) {
      res.status(204).end();
      return;
    }

    if (isRedirectResponse(result)) {
      res.redirect(result.statusCode, result.targetUrl);
      return;
    }

    res.status(result.statusCode).json({
      message: result.message,
      success: result.success,
      data: result.data,
      errors: result.success === false ? result.errors : undefined,
    });
  };
}
