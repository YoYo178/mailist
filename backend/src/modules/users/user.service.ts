import type { TInputUser } from './user.model.js';
import type { UserRepository } from './user.repository.js';

export class UserService {
  constructor(private userRepository: UserRepository) {
    this.bindMethods();
  }

  private bindMethods() {
    this.createUser = this.createUser.bind(this);
    this.getUserByEmail = this.getUserByEmail.bind(this);
  }

  async createUser(data: TInputUser) {
    return await this.userRepository.create(data);
  }

  async getUserById(id: string) {
    return await this.userRepository.findById(id);
  }

  async getUserByEmail(email: string) {
    return await this.userRepository.findByEmail(email);
  }

  async getUserByEmailWithPassword(email: string) {
    return this.userRepository.findByEmailWithPassword(email);
  }
}
