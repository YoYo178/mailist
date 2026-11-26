import type { TApiResponse } from '@/lib/api.lib.js';
import type { Request } from 'express';
import { UnauthorizedUserError } from '../auth/auth.errors.js';
import { EmailNotFoundError } from './email.errors.js';
import { emailIdParamsSchema, emailListQuerySchema } from './email.schemas.js';
import type { EmailService } from './email.service.js';

export class EmailController {
  constructor(private emailService: EmailService) {
    this.bindMethods();
  }

  private bindMethods() {
    this.getInbox = this.getInbox.bind(this);
    this.getById = this.getById.bind(this);
  }

  async getInbox(req: Request): Promise<TApiResponse> {
    if (!req.user?._id) throw UnauthorizedUserError();

    const { page, limit, priority, category } = emailListQuerySchema.parse(req.query);

    const result = await this.emailService.getInbox(req.user._id.toString(), page, limit, {
      ...(priority !== undefined && { priority }),
      ...(category !== undefined && { category }),
    });

    return {
      success: true,
      statusCode: 200,
      message: 'Inbox retrieved successfully',
      data: result,
    };
  }

  async getById(req: Request): Promise<TApiResponse> {
    if (!req.user?._id) throw UnauthorizedUserError();

    const { emailId } = emailIdParamsSchema.parse(req.params);

    const email = await this.emailService.getDetailsByIdAndUserId(emailId, req.user._id.toString());

    if (!email) throw EmailNotFoundError()

    return {
      success: true,
      statusCode: 200,
      message: 'Email retrieved successfully',
      data: email
    };
  }
}
