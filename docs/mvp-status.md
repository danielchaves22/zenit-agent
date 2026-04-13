# MVP Status - MyAgent

Ultima atualizacao: 2026-04-13
Commit base para retomada: `2a98966`

## Como retomar em um novo chat

Use esta frase no inicio do novo chat:

`Retome o MVP a partir do commit 2a98966 e do arquivo docs/mvp-status.md. Continue pelo proximo item pendente da Fase 0.`

---

## Visao geral do objetivo do MVP

Entregar um assistente pessoal com IA com:
- consulta de agenda real
- lembrete recorrente funcional
- notificacoes push em cenarios reais
- consultas financeiras uteis
- confirmacao explicita para escrita
- auditoria minima

---

## Estado atual implementado

- [x] Monorepo inicial (`apps`, `packages`, `infra`, `docs`)
- [x] Backend Node.js + TypeScript (Fastify)
- [x] Endpoint `GET /health`
- [x] Endpoint `POST /chat`
- [x] Autenticacao minima de desenvolvimento por header `x-user-id`
- [x] Prisma configurado
- [x] Banco PostgreSQL local via Docker
- [x] Redis local via Docker
- [x] Migration inicial aplicada
- [x] Modelos `User`, `ConversationThread`, `AgentAudit`
- [x] Auditoria de interacoes de chat
- [x] Mobile React Native (Expo) com tela inicial de chat
- [x] `packages/contracts` com schemas de request/response
- [x] `packages/sdk-client` para consumo do backend
- [x] README detalhado de onboarding e setup
- [x] Integracao minima com OpenAI Responses API no `POST /chat`
- [x] Persistencia de metadados de resposta do modelo no `AgentAudit`
- [x] Suporte a conversa multi-turn com `lastResponseId` por thread

---

## Roadmap por fase

## Fase 0 - Fundamentos

- [x] Estrutura base do backend de orquestracao
- [x] Banco operacional local e migration inicial
- [x] Integracao minima com OpenAI (Responses API)
- [x] Wire de orquestracao do agente no `POST /chat`
- [x] Configuracao de variaveis seguras para API key

## Fase 1 - Agenda

- [ ] Integracao Google Calendar
- [ ] Tool `calendar.list_events`
- [ ] Tool `calendar.find_free_slots`
- [ ] Fluxo de confirmacao explicita para `create/update`
- [ ] Primeiros testes E2E para leitura de agenda

## Fase 2 - Lembretes e notificacoes

- [ ] Modelo `ReminderRule`
- [ ] Scheduler operacional no backend
- [ ] Entrega de notificacoes push
- [ ] Tool `reminders.create_recurring`
- [ ] Tool `reminders.list`

## Fase 3 - Financas

- [ ] Integracao com API financeira (fonte de verdade)
- [ ] Tool `finance.get_summary`
- [ ] Tool `finance.list_due_bills`
- [ ] Tool `finance.list_transactions`
- [ ] Alertas de vencimento

## Fase 4 - Gmail e sinais inteligentes

- [ ] Integracao Gmail
- [ ] Tool `gmail.search_messages`
- [ ] Tool `gmail.read_message`
- [ ] Classificacao de sinais uteis (ex: encomenda, cobranca)

## Fase 5 - Refinamento

- [ ] Memoria curta da conversa
- [ ] Auditoria ampliada por tool/action
- [ ] Priorizacao de notificacoes
- [ ] Endurecimento de seguranca e observabilidade

---

## Proximo passo recomendado (curto prazo)

Executar Fase 1:
1. Implementar estrutura de integracao Google Calendar.
2. Criar `calendar.list_events` com leitura real.
3. Criar `calendar.find_free_slots` com regras basicas de disponibilidade.

---

## Criterios de pronto para avancar de fase

Fase 0 concluida quando:
- `POST /chat` usa OpenAI de forma real
- fluxo de erro e auditoria basica cobertos
- ambiente local reproduzivel para qualquer dev

Fase 1 concluida quando:
- usuario consegue consultar agenda real em linguagem natural
- usuario consegue encontrar horario livre
- qualquer escrita em agenda exige confirmacao explicita

---

## Notas tecnicas

- Header `x-user-id` e apenas provisorio para desenvolvimento.
- Porta do PostgreSQL local: `5433` (para evitar conflito com `5432`).
- Mobile le configuracao de backend em `apps/mobile/app.json` (`expo.extra.backendUrl`).
- A migration `add_last_response_id` foi adicionada; aplique com Docker ativo.
