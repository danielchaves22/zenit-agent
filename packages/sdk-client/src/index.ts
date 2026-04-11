import { ChatResponseSchema, type ChatRequest, type ChatResponse } from "@myagent/contracts";

interface FetcherResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

type Fetcher = (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<FetcherResponse>;

export interface BackendClientConfig {
  baseUrl: string;
  fetcher: Fetcher;
  userId: string;
}

export class BackendClient {
  constructor(private readonly config: BackendClientConfig) {}

  async sendChat(payload: ChatRequest): Promise<ChatResponse> {
    const response = await this.config.fetcher(`${this.config.baseUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": this.config.userId
      },
      body: JSON.stringify(payload)
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(`Backend request failed with status ${response.status}`);
    }

    return ChatResponseSchema.parse(json);
  }
}
