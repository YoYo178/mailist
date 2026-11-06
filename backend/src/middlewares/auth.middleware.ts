import env from '@/env.js';
import type { UserService } from '@/modules/users/user.service.js';
import type { NextFunction, Request, Response } from 'express';

export class AuthMiddleware {
  constructor(private readonly userService: UserService) {
    this.bindMethods();
  }

  private bindMethods() {
    this.authenticate = this.authenticate.bind(this);
  }

  async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.session.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User is not authorized to perform this action',
          data: null,
          errors: {},
        });
        return;
      }

      const user = await this.userService.getUserById(userId);

      if (!user) {
        // The account may have been deleted since login.
        await new Promise<void>((resolve) => {
          req.session.destroy(() => resolve());
        });

        res.clearCookie('mailist.sid', {
          httpOnly: true,
          secure: env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });

        res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          errors: {},
        });
        return;
      }

      req.user = user;
      next();
    } catch (err) {
      next(err);
    }
  }
}
