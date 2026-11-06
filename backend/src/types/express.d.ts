import type { IUser } from '@/modules/users/user.model.ts';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
