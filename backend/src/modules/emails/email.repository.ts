import mongoose from 'mongoose';
import { Triage } from '../triage/triage.model.js';
import { Email, type IEmail, type TInputEmail } from './email.model.js';
import type { IEmailListFilters, IEmailListResult, IEmailWithTriage } from './email.types.js';

const TRIAGE_LOOKUP_OBJ = {
  $lookup: {
    from: Triage.collection.name,
    localField: '_id',
    foreignField: 'emailId',
    as: 'triage',
  },
}

const TRIAGE_UNWIND_OBJ = {
  $unwind: {
    path: '$triage',
    preserveNullAndEmptyArrays: true,
  },
}

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

  async upsertMany(emails: TInputEmail[]): Promise<IEmail[]> {
    if (!emails.length) return [];

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

    const connectedAccountId = emails[0]?.connectedAccountId ?? '';
    const messageIds = emails.map((email) => email.messageId);

    return Email.find({
      connectedAccountId,
      messageId: { $in: messageIds },
    }).exec();
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

  async findInbox(
    userId: string,
    page: number = 1,
    limit: number = 20,
    filters: IEmailListFilters = {},
  ): Promise<IEmailListResult> {
    const $match: Record<string, unknown> = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    const triageFilters: Record<string, unknown> = {};

    if (filters.priority) triageFilters['triage.priority'] = filters.priority;
    if (filters.category) triageFilters['triage.category'] = filters.category;

    const [result] = await Email.aggregate([
      { $match },
      { ...TRIAGE_LOOKUP_OBJ },
      { ...TRIAGE_UNWIND_OBJ },
      ...(Object.keys(triageFilters).length ? [{ $match: triageFilters }] : []),
      {
        $facet: {
          emails: [
            { $sort: { date: -1, _id: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
          ],
          metadata: [{ $count: 'total' }],
        },
      },
    ]);

    const total = result?.metadata?.[0]?.total ?? 0;

    return {
      emails: result?.emails ?? [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findDetailsByIdAndUserId(emailId: string, userId: string): Promise<IEmailWithTriage | null> {

    const $match = {
      _id: new mongoose.Types.ObjectId(emailId),
      userId: new mongoose.Types.ObjectId(userId)
    }

    const [email] = await Email.aggregate([
      { $match },
      { ...TRIAGE_LOOKUP_OBJ },
      { ...TRIAGE_UNWIND_OBJ },
      { $limit: 1 }
    ])

    return email ?? null;
  }
}
