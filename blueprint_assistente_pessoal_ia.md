# Blueprint de Arquitetura e Implementação

**Assistente pessoal com IA, agenda, finanças, lembretes e integrações externas**

## Objetivo
Criar uma aplicação pessoal que permita conversar em linguagem natural com um assistente capaz de consultar agenda, e-mails relevantes, lembretes recorrentes e dados financeiros centralizados, além de gerar alertas úteis e confiáveis.

## Decisão estrutural principal
A IA será a camada de linguagem, decisão e priorização. O backend próprio será o sistema nervoso central: autenticação, ferramentas, integrações, scheduler, notificações, auditoria e execução real das ações.

## Princípios
- O app mobile conversa apenas com o backend próprio.
- O backend próprio é o único ponto autorizado a falar com OpenAI, Google e sistemas internos.
- A IA interpreta e decide; o backend executa e registra.
- Ações com efeito no mundo real exigem confirmação explícita do usuário.
- Lembretes, vencimentos e verificações recorrentes são responsabilidades operacionais do backend.
- A API financeira permanece como fonte de verdade para dados financeiros.

## Arquitetura alvo
1. App mobile
2. Backend de orquestração
3. Camada agentic via OpenAI
4. Integração Google
5. API financeira
6. Infra de eventos

### Fluxo base
Usuário → App mobile → Backend próprio → OpenAI / Google / API financeira / Scheduler / Push → App mobile

## Responsabilidades do backend
- Autenticação e autorização
- Orquestração do agente
- Scheduler e regras
- Notificações
- Observabilidade e auditoria

## Ferramentas sugeridas
- `calendar.list_events`
- `calendar.find_free_slots`
- `calendar.create_event`
- `calendar.update_event`
- `gmail.search_messages`
- `gmail.read_message`
- `finance.get_summary`
- `finance.list_due_bills`
- `finance.list_transactions`
- `reminders.create_recurring`
- `reminders.list`
- `notifications.list_recent`

## Casos de uso prioritários
- Consultar agenda
- Encontrar horário livre
- Criar lembrete recorrente
- Avisar conta vencendo
- Detectar atualização de encomenda
- Consultar finanças por linguagem natural

## Modelo de dados mínimo
- User
- ConnectedAccount
- ConversationThread
- ReminderRule
- Notification
- AgentAudit
- EmailSignal
- DueItemSnapshot

## Escolhas técnicas recomendadas
- App mobile: React Native (recomendado para este caso)
- Backend de orquestração: Node.js + TypeScript
- Banco operacional: PostgreSQL
- Fila / jobs: BullMQ, pg-boss ou equivalente
- Push notifications: FCM / APNs
- Integração com OpenAI: Responses API + Agents SDK

## Roadmap
### Fase 0 — Fundamentos
- Backend de orquestração
- Banco operacional
- Integração mínima com OpenAI

### Fase 1 — Agenda
- Google Calendar
- Tools de leitura
- Criação/edição com confirmação

### Fase 2 — Lembretes e notificações
- ReminderRule
- Scheduler
- Push notifications

### Fase 3 — Finanças
- Integração com API financeira
- Tools de leitura
- Alertas de vencimento

### Fase 4 — Gmail e sinais inteligentes
- Integração Gmail
- Busca e leitura
- Classificação de sinais úteis

### Fase 5 — Refinamento
- Memória curta
- Auditoria
- Priorização de notificações
- Segurança e observabilidade

## Critérios de aceite do MVP
- Consulta real de agenda
- Lembrete recorrente funcional
- Push notifications em cenários reais
- Consultas financeiras úteis
- Confirmação explícita para escrita
- Auditoria mínima

## Riscos a evitar
- Mobile falando diretamente com OpenAI, Google ou finanças
- Tool para cada frase
- IA como motor operacional de lembretes
- Ações sensíveis sem confirmação
- Exposição ingênua de endpoints financeiros
