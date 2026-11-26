import type { ITriage, TTriageCategory, TTriagePriority } from "../triage/triage.types.js";
import type { IEmail } from "./email.model.js";

export interface IEmailListFilters {
  priority?: TTriagePriority;
  category?: TTriageCategory;
}

export interface IEmailWithTriage extends IEmail {
  triage: ITriage | null;
}

export interface IEmailListResult {
  emails: IEmailWithTriage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
}
