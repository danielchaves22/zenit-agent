import OpenAI from "openai";

export class OpenAIConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAIConfigError";
  }
}

export interface GenerateReplyParams {
  message: string;
  previousResponseId?: string | undefined;
}

export interface GenerateReplyResult {
  answer: string;
  responseId: string;
  model: string;
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
    totalTokens: number | null;
  } | null;
}

const apiKey = process.env.OPENAI_API_KEY?.trim();
const model = process.env.OPENAI_MODEL?.trim() || "gpt-5.4-mini";
const reasoningEffortRaw = process.env.OPENAI_REASONING_EFFORT?.trim().toLowerCase();

const client = apiKey ? new OpenAI({ apiKey }) : null;

function extractOutputText(output: unknown): string {
  if (!Array.isArray(output)) {
    return "";
  }

  const parts: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const maybeContent = (item as { content?: unknown }).content;
    if (!Array.isArray(maybeContent)) {
      continue;
    }

    for (const contentItem of maybeContent) {
      if (!contentItem || typeof contentItem !== "object") {
        continue;
      }
      const typed = contentItem as { type?: string; text?: string };
      if (typed.type === "output_text" && typeof typed.text === "string") {
        parts.push(typed.text);
      }
    }
  }

  return parts.join("\n").trim();
}

function parseReasoningEffort(
  value: string | undefined
): "minimal" | "low" | "medium" | "high" | undefined {
  if (!value) {
    return undefined;
  }

  if (value === "minimal" || value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return undefined;
}

export async function generateAssistantReply({
  message,
  previousResponseId
}: GenerateReplyParams): Promise<GenerateReplyResult> {
  if (!client) {
    throw new OpenAIConfigError(
      "OPENAI_API_KEY is not configured. Set OPENAI_API_KEY in apps/backend/.env."
    );
  }

  const reasoningEffort = parseReasoningEffort(reasoningEffortRaw);

  const response = await client.responses.create({
    model,
    instructions:
      "You are MyAgent, a personal assistant focused on agenda, reminders and finance. Be concise and practical.",
    input: message,
    ...(previousResponseId ? { previous_response_id: previousResponseId } : {}),
    ...(reasoningEffort ? { reasoning: { effort: reasoningEffort } } : {}),
    store: true
  });

  const answer = response.output_text?.trim() || extractOutputText(response.output);

  if (!answer) {
    throw new Error("Model response did not contain output text.");
  }

  return {
    answer,
    responseId: response.id,
    model: response.model ?? model,
    usage: response.usage
      ? {
          inputTokens: response.usage.input_tokens ?? null,
          outputTokens: response.usage.output_tokens ?? null,
          totalTokens: response.usage.total_tokens ?? null
        }
      : null
  };
}
