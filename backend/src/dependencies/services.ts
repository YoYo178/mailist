import { UserService } from '@/modules/users/user.service.js';
import { userRepository } from './repositories.js';
import { AuthService } from '@/modules/auth/auth.service.js';

export const userService = new UserService(userRepository);

export const authService = new AuthService(userService);
