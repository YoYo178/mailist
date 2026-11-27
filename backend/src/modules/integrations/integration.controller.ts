import type { TApiResponse } from "@/lib/api.lib.js";
import { PROVIDERS } from "./gmail/gmail.model.js";

export class IntegrationController {
  constructor() {
    this.bindMethods();
  }

  private bindMethods() {
    this.listIntegrations = this.listIntegrations.bind(this);
  }

  listIntegrations(): TApiResponse {
    return {
      success: true,
      statusCode: 200,
      message: 'Integrations fetched successfully',
      data: {
        supportedIntegrations: PROVIDERS
      }
    }
  }
}
