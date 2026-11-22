import mongoose from 'mongoose';
import { Email, type IEmail, type TInputEmail } from './email.model.js';

export class EmailRepository {
  async findByUserId(userId: string, page: number = 1, limit: number = 20): Promise<IEmail[]> {
    return Email.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async findByThreadId(userId: string, threadId: string): Promise<IEmail[]> {
    return Email.find({
      userId: new mongoose.Types.ObjectId(userId),
      threadId,
    }).sort({ date: 1 });
  }

  async upsertMany(emails: TInputEmail[]): Promise<void> {
    if (!emails.length) return;

    await Email.bulkWrite(
      emails.map((email) => ({
        updateOne: {
          filter: {
            connectedAccountId: email.connectedAccountId,
            messageId: email.messageId,
          },
          update: { $set: email },
          upsert: true,
        },
      })),
    );
  }

  async deleteByConnectedAccountId(connectedAccountId: string) {
    return Email.deleteMany({
      connectedAccountId,
    });
  }

  async findByIdAndUserId(emailId: string, userId: string): Promise<IEmail | null> {
    return Email.findOne({
      _id: new mongoose.Types.ObjectId(emailId),
      userId: new mongoose.Types.ObjectId(userId),
    });
  }
}
