import { User, type IUser, type TInputUser } from './user.model.js';

export class UserRepository {
  async findAll(): Promise<IUser[]> {
    return User.find().lean().exec();
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).lean().exec();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).lean().exec();
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select('+passwordHash').lean().exec();
  }

  async create(data: TInputUser) {
    return await User.create({
      ...data,
    });
  }

  async update(id: string, data: Partial<TInputUser>): Promise<IUser | null> {
    const user = await User.findOneAndUpdate(
      { _id: id },
      {
        ...data,
      },
      { upsert: true, lean: true },
    );

    return user;
  }

  async deleteOne(id: string): Promise<void> {
    await User.findById(id)?.deleteOne?.();
  }
}
