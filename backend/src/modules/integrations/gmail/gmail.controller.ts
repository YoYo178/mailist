import type { TApiResponse } from '@/lib/api.lib.js';
import { HttpStatus } from '@/lib/http.lib.js';
import { UnauthorizedUserError } from '@/modules/auth/auth.errors.js';
import type { Request } from 'express';
import { callbackDeniedSchema, callbackSuccessSchema } from './gmail.schema.js';
import type { GmailService } from './gmail.service.js';

export class GmailController {
  constructor(private gmailService: GmailService) {
    this.bindMethods();
  }

  private bindMethods() {
    this.connect = this.connect.bind(this);
    this.callback = this.callback.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.getStatus = this.getStatus.bind(this);
  }

  async connect(req: Request): Promise<TApiResponse> {
    if (!req.user?._id || !req.sessionID) throw UnauthorizedUserError();

    const targetUrl = await this.gmailService.getAuthorizationUrl(
      req.user._id.toString(),
      req.sessionID,
    );

    return {
      statusCode: HttpStatus.FOUND,
      targetUrl,
    };
  }

  async callback(req: Request): Promise<TApiResponse> {
    if (typeof req.query['error'] === 'string') {
      const { state } = callbackDeniedSchema.parse(req.query);

      await this.gmailService.handleAuthorizationDenial(state, req.sessionID);
    }

    const { code, state } = callbackSuccessSchema.parse(req.query);

    await this.gmailService.connectAccount(code, state, req.sessionID);

    return {
      data: null,
      message: 'Google account connected successfully',
      statusCode: HttpStatus.OK,
      success: true,
    };
  }

  async disconnect(req: Request): Promise<TApiResponse> {
    const userId = req.user?._id.toString();

    if (!userId) throw UnauthorizedUserError();

    await this.gmailService.disconnectAccount(userId);

    return {
      data: null,
      message: 'Gmail account disconnected successfully.',
      statusCode: HttpStatus.OK,
      success: true,
    };
  }

  async getProfile(req: Request): Promise<TApiResponse> {
    if (!req.user?._id) throw UnauthorizedUserError();

    const profile = await this.gmailService.getProfile(req.user._id.toString());

    return {
      data: {
        email: profile.emailAddress,
        totalMessages: profile.messagesTotal,
        totalThreads: profile.threadsTotal,
      },
      message: 'Fetched Gmail profile successfully',
      statusCode: HttpStatus.OK,
      success: true,
    };
  }

  async getStatus(req: Request): Promise<TApiResponse> {
    if (!req.user?._id) throw UnauthorizedUserError();

    const status = await this.gmailService.getStatus(req.user._id.toString());

    return {
      data: status,
      message: 'Fetched Gmail connection status successfully',
      statusCode: HttpStatus.OK,
      success: true,
    };
  }
}
