import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { ChatRequestSchema } from "@myagent/contracts";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(helmet);

app.get("/health", async () => {
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

  return {
    threadId: parsed.data.threadId,
    answer: "Scaffold inicial ativo. Orquestração do agente será adicionada na próxima etapa."
  };
});

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
