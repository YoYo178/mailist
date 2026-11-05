export interface EmailTriageJobData {
  emailId: string;
  userId: string;
}

export interface EmailTriageJobResult {
  success: boolean;
  emailId: string;
}
