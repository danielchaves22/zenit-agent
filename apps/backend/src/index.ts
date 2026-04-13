import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { ChatRequestSchema } from "@myagent/contracts";
import { prisma } from "./db.js";
import { generateAssistantReply, OpenAIConfigError } from "./openai.js";

declare module "fastify" {
  interface FastifyRequest {
    authUser: {
      id: string;
      externalId: string;
    };
  }
}

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(helmet);

app.addHook("preHandler", async (request, reply) => {
  if (request.method === "GET" && request.url === "/health") {
    return;
  }

  const userHeader = request.headers["x-user-id"];
  if (typeof userHeader !== "string" || userHeader.trim().length === 0) {
    await reply.status(401).send({
      error: "missing_user",
      message: "Header x-user-id is required"
    });
    return;
  }

  const user = await prisma.user.upsert({
    where: { externalId: userHeader.trim() },
    update: {},
    create: { externalId: userHeader.trim() }
  });

  request.authUser = {
    id: user.id,
    externalId: user.externalId
  };
});

app.get("/health", async () => {
  await prisma.$queryRaw`SELECT 1`;

  return { ok: true, service: "backend", timestamp: new Date().toISOString() };
});

app.post("/chat", async (request, reply) => {
  const parsed = ChatRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({
      error: "invalid_request",
      details: parsed.error.flatten()
    });
  }

  const message = parsed.data.message.trim();
  if (message.length === 0) {
    return reply.status(400).send({ error: "empty_message" });
  }

  let threadId = parsed.data.threadId;
  let threadLastResponseId: string | undefined;

  if (threadId) {
    const existing = await prisma.conversationThread.findUnique({
      where: { id: threadId }
    });
    if (!existing || existing.userId !== request.authUser.id) {
      return reply.status(404).send({
        error: "thread_not_found",
        message: "Thread not found for current user"
      });
    }

    threadLastResponseId = existing.lastResponseId ?? undefined;
  } else {
    const created = await prisma.conversationThread.create({
      data: {
        userId: request.authUser.id,
        title: message.slice(0, 80)
      }
    });
    threadId = created.id;
  }

  const inputPayload = {
    threadId,
    message,
    openai: {
      model: process.env.OPENAI_MODEL?.trim() || "gpt-5.4-mini",
      previousResponseId: threadLastResponseId ?? null
    }
  };

  try {
    const openaiResult = await generateAssistantReply({
      message,
      previousResponseId: threadLastResponseId
    });

    await prisma.conversationThread.update({
      where: { id: threadId },
      data: { lastResponseId: openaiResult.responseId }
    });

    const audit = await prisma.agentAudit.create({
      data: {
        userId: request.authUser.id,
        threadId,
        action: "chat.exchange",
        status: "completed",
        inputPayload,
        outputPayload: {
          answer: openaiResult.answer,
          openai: {
            responseId: openaiResult.responseId,
            model: openaiResult.model,
            usage: openaiResult.usage
          }
        }
      }
    });

    return {
      threadId,
      auditId: audit.id,
      answer: openaiResult.answer
    };
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "Unexpected chat orchestration error.";
    const statusCode = error instanceof OpenAIConfigError ? 503 : 502;
    const errorCode = error instanceof OpenAIConfigError ? "openai_not_configured" : "openai_request_failed";

    const audit = await prisma.agentAudit.create({
      data: {
        userId: request.authUser.id,
        threadId,
        action: "chat.exchange",
        status: "failed",
        inputPayload,
        outputPayload: {
          error: messageText
        }
      }
    });

    request.log.error({
      msg: "Chat exchange failed",
      error: messageText,
      threadId,
      auditId: audit.id
    });

    return reply.status(statusCode).send({
      error: errorCode,
      message: messageText,
      auditId: audit.id
    });
  }
});

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  await prisma.$disconnect();
  process.exit(1);
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
