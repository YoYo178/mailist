import argon2 from 'argon2';

import type { IUser } from '../users/user.model.js';
import type { UserService } from '../users/user.service.js';
import { InvalidLoginError, UserExistsError } from './auth.errors.js';
import type { TLoginData, TRegisterData } from './auth.schema.js';

export class AuthService {
  constructor(private userService: UserService) {
    this.bindMethods();
  }

  private bindMethods() {
    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
  }

  async handleLogin(data: TLoginData): Promise<IUser> {
    const { email, password } = data;

    const user = await this.userService.getUserByEmailWithPassword(email);
    if (!user) throw InvalidLoginError();

    const passwordMatches = await argon2.verify(user.passwordHash, password);
    if (!passwordMatches) throw InvalidLoginError();

    return user;
  }

  async handleRegister(data: TRegisterData): Promise<IUser> {
    const { email, name, password } = data;

    const userExists = await this.userService.getUserByEmail(email);
    if (userExists) throw UserExistsError();

    const passwordHash = await argon2.hash(password);

    const user = await this.userService.createUser({
      email,
      name,
      passwordHash,
    });

    return user;
  }
}
