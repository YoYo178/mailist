import { UserService } from '@/modules/users/user.service.js';
import { userRepository } from './repositories.js';

export const userService = new UserService(userRepository);
