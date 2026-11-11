import { GmailRepository } from '@/modules/integrations/gmail/gmail.repository.js';
import { UserRepository } from '@/modules/users/user.repository.js';

export const userRepository = new UserRepository();

export const gmailRepository = new GmailRepository();
