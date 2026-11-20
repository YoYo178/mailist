import {
  ConnectedAccount,
  type TGmailSyncStatus,
  type TInputConnectedAccount,
} from './gmail.model.js';

export class GmailRepository {
  async create(data: TInputConnectedAccount) {
    return await ConnectedAccount.create({
      ...data,
    });
  }

  async upsert(data: TInputConnectedAccount) {
    const identifiers = {
      userId: data.userId,
      provider: data.provider,
    };

    const $set = {
      email: data.email,
      accessToken: data.accessToken,
      ...(data.expiresAt && {
        expiresAt: data.expiresAt,
      }),
      scopes: data.scopes,
      ...(data.refreshToken && {
        refreshToken: data.refreshToken,
      }),
    };

    const update = {
      $set,
      $setOnInsert: {
        syncStatus: 'pending',
        lastSyncedAt: null,
        syncError: null,
      },
      ...(!data.expiresAt && {
        $unset: { expiresAt: 1 },
      }),
    };

    return ConnectedAccount.findOneAndUpdate(identifiers, update, {
      upsert: true,
      returnDocument: 'after',
      runValidators: true,
    });
  }

  async findByIdWithTokens(id: string) {
    return ConnectedAccount.findById(id).select('+accessToken +refreshToken').exec();
  }

  async findByUserId(userId: string) {
    return ConnectedAccount.findOne({
      userId,
      provider: 'google',
    })
      .select('email syncStatus lastSyncedAt syncError')
      .lean()
      .exec();
  }

  async findByUserIdWithTokens(userId: string) {
    return ConnectedAccount.findOne({ userId, provider: 'google' })
      .select('+accessToken +refreshToken')
      .exec();
  }

  async updateTokens(
    id: string,
    data: {
      accessToken: string;
      expiresAt?: Date;
    },
  ) {
    return ConnectedAccount.findByIdAndUpdate(
      id,
      {
        $set: {
          accessToken: data.accessToken,
          ...(data.expiresAt && {
            expiresAt: data.expiresAt,
          }),
        },
        ...(!data.expiresAt && {
          $unset: { expiresAt: 1 },
        }),
      },
      { runValidators: true },
    );
  }

  async deleteByUserId(userId: string) {
    return ConnectedAccount.findOneAndDelete({
      userId,
      provider: 'google',
    });
  }

  async existsById(id: string): Promise<boolean> {
    return Boolean(await ConnectedAccount.exists({ _id: id }));
  }

  async updateSyncStatus(
    id: string,
    data: {
      status: TGmailSyncStatus;
      lastSyncedAt?: Date | null;
      syncError?: string | null;
    },
  ) {
    return ConnectedAccount.findByIdAndUpdate(
      id,
      {
        $set: {
          syncStatus: data.status,
          ...(data.lastSyncedAt !== undefined && {
            lastSyncedAt: data.lastSyncedAt,
          }),
          ...(data.syncError !== undefined && {
            syncError: data.syncError,
          }),
        },
      },
      { runValidators: true },
    );
  }
}
