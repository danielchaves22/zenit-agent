import type { ChatRequest } from "@myagent/contracts";

type Fetcher = (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<unknown>;

export interface BackendClientConfig {
  baseUrl: string;
  fetcher: Fetcher;
}

export class BackendClient {
  constructor(private readonly config: BackendClientConfig) {}

  async sendChat(payload: ChatRequest): Promise<unknown> {
    return this.config.fetcher(`${this.config.baseUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }
}
