import { ConnectedAccount, type TInputConnectedAccount } from './gmail.model.js';

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
      providerAccountId: data.providerAccountId,
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
      },
      { runValidators: true },
    );
  }
}
