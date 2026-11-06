import type { NextFunction, Request, RequestHandler, Response } from 'express';

// API Error
interface IApiErrorParams<T> {
  statusCode: number;
  message: string;
  data: T;
  errors?: Record<string, unknown>;
}

export class ApiError<T = null> extends Error {
  public statusCode: number;
  public data: T;
  public success: boolean;
  public errors: Record<string, unknown>;

  constructor({
    statusCode,
    message = 'Something went wrong',
    data,
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
function isNoContentResponse(result: TApiResponse): result is IApiNoContentResponse {
  return result.statusCode === 204;
}

interface IApiNoContentResponse {
  statusCode: 204;
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
  | IApiNoContentResponse;

type ControllerFn = (...args: Parameters<RequestHandler>) => TApiResponse | Promise<TApiResponse>;
export function routeWrapper(handlerFn: ControllerFn) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = await handlerFn(req, res, next);

    if (isNoContentResponse(result)) {
      res.status(204).end();
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
