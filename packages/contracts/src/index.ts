import { z } from "zod";

export const ChatRequestSchema = z.object({
  threadId: z.string().min(1).optional(),
  message: z.string().min(1)
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const ChatResponseSchema = z.object({
  threadId: z.string().min(1),
  auditId: z.string().min(1),
  answer: z.string().min(1)
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;
