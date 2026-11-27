import type {
  IBaseMongoDocumentWithTimestamp,
  TMongoFieldsWithTimestamp,
} from '@/types/mongodb.types.js';
import mongoose from 'mongoose';

interface IUser extends IBaseMongoDocumentWithTimestamp {
  name: string;
  email: string;
  passwordHash: string;
}

type TInputUser = Omit<IUser, TMongoFieldsWithTimestamp>;

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
