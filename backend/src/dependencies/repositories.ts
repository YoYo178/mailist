import { EmailRepository } from '@/modules/emails/email.repository.js';
import { GmailRepository } from '@/modules/integrations/gmail/gmail.repository.js';
import { TriageRepository } from '@/modules/triage/triage.repository.js';
import { UserRepository } from '@/modules/users/user.repository.js';

export const userRepository = new UserRepository();

export const gmailRepository = new GmailRepository();

export const emailRepository = new EmailRepository();

export const triageRepository = new TriageRepository();
