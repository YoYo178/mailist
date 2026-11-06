import env from '@/env.js';
import type { TApiResponse } from '@/lib/api.lib.js';
import type { Request, Response } from 'express';
import { UserSerializer } from '../users/user.serializer.js';
import { UnauthorizedUserError } from './auth.errors.js';
import { loginSchema, registerSchema } from './auth.schema.js';
import type { AuthService } from './auth.service.js';

export class AuthController {
  constructor(private authService: AuthService) {
    this.bindMethods();
  }

  private bindMethods() {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.getMe = this.getMe.bind(this);
  }

  async register(req: Request): Promise<TApiResponse> {
    const validatedBody = registerSchema.parse(req.body);

    const user = await this.authService.handleRegister(validatedBody);

    return {
      data: UserSerializer.serialize(user),
      message: 'User created successfully',
      statusCode: 201, // Created
      success: true,
    };
  }
  async login(req: Request): Promise<TApiResponse> {
    const validatedBody = loginSchema.parse(req.body);

    const user = await this.authService.handleLogin(validatedBody);

    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    req.session.userId = user._id.toString();

    return {
      data: UserSerializer.serialize(user),
      message: 'Logged in successfully',
      statusCode: 200, // OK
      success: true,
    };
  }
  async logout(req: Request, res: Response): Promise<TApiResponse> {
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    res.clearCookie('mailist.sid', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return {
      statusCode: 204,
    };
  }
  getMe(req: Request): TApiResponse {
    if (!req.user) throw UnauthorizedUserError();

    return {
      data: UserSerializer.serialize(req.user),
      message: 'Fetched data succesfully',
      statusCode: 200,
      success: true,
    };
  }
}
