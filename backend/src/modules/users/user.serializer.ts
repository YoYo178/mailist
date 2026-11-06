import type { IUser } from './user.model.js';

export class UserSerializer {
  static serialize(user: IUser) {
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
