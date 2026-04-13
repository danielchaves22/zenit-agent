# MyAgent

Assistente pessoal com IA em arquitetura monorepo, com foco em:
- conversa em linguagem natural
- orquestraÃ§Ã£o via backend prÃ³prio
- auditoria de aÃ§Ãµes
- base para integraÃ§Ãµes com agenda, e-mail, finanÃ§as e notificaÃ§Ãµes

Este repositÃ³rio jÃ¡ possui um scaffold funcional de:
- backend (`Fastify + Prisma + PostgreSQL`)
- mobile (`React Native + Expo`)
- pacotes compartilhados (`contracts`, `sdk-client`, `domain`, `tool-definitions`)

---

## 1) VisÃ£o geral da arquitetura

Fluxo alvo:

`UsuÃ¡rio -> App Mobile -> Backend -> OpenAI / Google / API Financeira / Scheduler / Push`

PrincÃ­pios implementados no scaffold:
- app mobile fala apenas com o backend
- backend centraliza regras, autenticaÃ§Ã£o e auditoria
- aÃ§Ãµes sensÃ­veis devem ser confirmadas (a regra estÃ¡ prevista; execuÃ§Ã£o real de tools ainda serÃ¡ evoluÃ­da)

Estado atual (MVP tÃ©cnico inicial):
- endpoint `POST /chat` funcional
- criaÃ§Ã£o automÃ¡tica de thread de conversa
- criaÃ§Ã£o de registro de auditoria por interaÃ§Ã£o
- autenticaÃ§Ã£o mÃ­nima de desenvolvimento via header `x-user-id`

---

## 2) Estrutura do monorepo

```txt
myagent/
  apps/
    backend/              # API Fastify + Prisma
    mobile/               # App React Native (Expo)
  packages/
    contracts/            # Schemas e tipos compartilhados (Zod)
    sdk-client/           # Cliente TypeScript para consumir backend
    domain/               # Regras de domÃ­nio (base)
    tool-definitions/     # CatÃ¡logo de tools (base)
    config/               # ConfiguraÃ§Ãµes compartilhadas
  infra/
    docker/               # docker-compose (Postgres + Redis)
    migrations/           # espaÃ§o para artefatos complementares
    observability/        # espaÃ§o para observabilidade
  docs/
    architecture/
    adr/
```

---

## 3) PrÃ©-requisitos

Instale no ambiente local:
- Node.js `>= 22`
- Corepack habilitado (vem com Node moderno)
- Docker Desktop + Docker Compose v2
- Git

Para rodar mobile no celular:
- Expo Go (Android/iOS)

Para rodar iOS localmente:
- macOS + Xcode (opcional)

---

## 4) Setup do ambiente (passo a passo)

### 4.1 Clonar e instalar dependÃªncias

```bash
git clone <url-do-repositorio>
cd myagent
corepack pnpm install --ignore-scripts
```

Nota:
- o projeto usa `pnpm` via `corepack`, nÃ£o `npm`.

### 4.2 Subir infraestrutura local

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

ServiÃ§os esperados:
- PostgreSQL em `localhost:5433`
- Redis em `localhost:6379`

Verificar:

```bash
docker compose -f infra/docker/docker-compose.yml ps
```

### 4.3 Configurar backend

Crie o arquivo de ambiente do backend:

Linux/macOS:
```bash
cp apps/backend/.env.example apps/backend/.env
```

Windows PowerShell:
```powershell
Copy-Item apps/backend/.env.example apps/backend/.env
```

Depois de copiar, configure no `apps/backend/.env`:
- `OPENAI_API_KEY` (obrigatorio para `POST /chat`)
- `OPENAI_MODEL` (padrao: `gpt-5.4-mini`)
- `OPENAI_REASONING_EFFORT` (opcional)

Gerar client Prisma e aplicar migration:

```bash
corepack pnpm --filter @myagent/backend db:generate
corepack pnpm --filter @myagent/backend exec prisma migrate dev --name init
```

### 4.4 Configurar mobile

A configuraÃ§Ã£o atual do mobile estÃ¡ em:
- `apps/mobile/app.json` -> `expo.extra.backendUrl`
- `apps/mobile/app.json` -> `expo.extra.userId`

Por padrÃ£o:
- `backendUrl`: `http://localhost:3000`
- `userId`: `demo-user`

Se for testar em dispositivo fÃ­sico, troque `backendUrl` para o IP da sua mÃ¡quina na rede local.

---

## 5) Como executar o projeto

### 5.1 Rodar backend

```bash
corepack pnpm --filter @myagent/backend dev
```

Backend disponÃ­vel em:
- `http://localhost:3000`

Endpoints atuais:
- `GET /health`
- `POST /chat`

### 5.2 Rodar mobile (Expo)

Em outro terminal:

```bash
corepack pnpm --filter @myagent/mobile dev
```

Comandos Ãºteis:

```bash
corepack pnpm --filter @myagent/mobile android
corepack pnpm --filter @myagent/mobile ios
corepack pnpm --filter @myagent/mobile web
```

---

## 6) Scripts Ãºteis

Na raiz do monorepo:

```bash
corepack pnpm dev
corepack pnpm build
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
```

Scripts por workspace:

```bash
corepack pnpm --filter @myagent/backend dev
corepack pnpm --filter @myagent/backend build
corepack pnpm --filter @myagent/backend db:generate
corepack pnpm --filter @myagent/backend db:migrate
corepack pnpm --filter @myagent/backend db:push

corepack pnpm --filter @myagent/mobile dev
corepack pnpm --filter @myagent/mobile typecheck
```

---

## 7) ValidaÃ§Ã£o rÃ¡pida do setup

### 7.1 Healthcheck

```bash
curl http://localhost:3000/health
```

Resposta esperada (exemplo):

```json
{
  "ok": true,
  "service": "backend",
  "timestamp": "2026-04-11T20:21:59.985Z"
}
```

### 7.2 Chat com auditoria

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -H "x-user-id: demo-user" \
  -d '{"message":"Quais compromissos tenho hoje?"}'
```

Resposta esperada (exemplo):

```json
{
  "threadId": "cmxxxxx",
  "auditId": "cmxxxxx",
  "answer": "Resposta gerada pelo modelo da OpenAI."
}
```

---

## 8) Contratos de API atuais

`POST /chat`

Request:

```json
{
  "threadId": "opcional",
  "message": "texto obrigatÃ³rio"
}
```

Headers:
- `x-user-id` (obrigatÃ³rio)

Response:

```json
{
  "threadId": "string",
  "auditId": "string",
  "answer": "string"
}
```

Erros comuns:
- `401 missing_user` (header ausente)
- `400 invalid_request` (payload invÃ¡lido)
- `400 empty_message` (mensagem vazia)
- `404 thread_not_found` (thread nÃ£o pertence ao usuÃ¡rio)
- `503 openai_not_configured` (`OPENAI_API_KEY` ausente)
- `502 openai_request_failed` (falha ao chamar OpenAI)

---

## 9) Modelo de dados atual (Prisma)

Entidades implementadas:
- `User`
  - `id`, `externalId`, `email`, timestamps
- `ConversationThread`
  - vÃ­nculo com `User`, `title`, `lastResponseId`, timestamps
- `AgentAudit`
  - vÃ­nculo com `User`/`ConversationThread`, `action`, `status`, `inputPayload`, `outputPayload`, timestamp

Arquivo de referÃªncia:
- `apps/backend/prisma/schema.prisma`

---

## 10) Troubleshooting

### Porta 5432 ocupada

O projeto jÃ¡ usa `5433` para evitar conflito:
- `infra/docker/docker-compose.yml`: `5433:5432`
- `apps/backend/.env.example`: `localhost:5433`

### Backend nÃ£o conecta no banco

Verifique:
1. containers ativos (`docker compose ... ps`)
2. valor de `DATABASE_URL` em `apps/backend/.env`
3. migration aplicada (`prisma migrate dev`)

### Mobile nÃ£o conecta no backend no dispositivo fÃ­sico

Use IP local da mÃ¡quina host em `apps/mobile/app.json`, por exemplo:

```json
"extra": {
  "backendUrl": "http://192.168.0.10:3000",
  "userId": "demo-user"
}
```

### `x-user-id` obrigatÃ³rio

Sem o header, todas as rotas (exceto `/health`) retornam `401`.

---

## 11) Roadmap tÃ©cnico imediato

PrÃ³ximos incrementos recomendados:
1. Integrar OpenAI Responses API no `POST /chat`.
2. Implementar tools de agenda (`calendar.list_events`, `calendar.find_free_slots`).
3. Adicionar confirmaÃ§Ã£o explÃ­cita para aÃ§Ãµes de escrita.
4. Evoluir autenticaÃ§Ã£o de `x-user-id` para fluxo real (JWT/OAuth).
5. Expandir auditoria e observabilidade.

---

## 12) ConvenÃ§Ãµes de desenvolvimento

- Linguagem principal: TypeScript
- Gerenciador de pacotes: `pnpm` (via `corepack`)
- Monorepo com workspaces
- ValidaÃ§Ã£o de tipos com `tsc`
- Contratos compartilhados em `packages/contracts`

Antes de abrir PR, execute:

```bash
corepack pnpm typecheck
corepack pnpm build
```

