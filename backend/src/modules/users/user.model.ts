import type { TMongoFields } from '@/types/mongodb.types.js';
import mongoose, { Types } from 'mongoose';

interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

type TInputUser = Omit<IUser, TMongoFields>;

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model('users', userSchema);

export { User, type IUser, type TInputUser };
