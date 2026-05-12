
# Why We Chose an MVP-First Strategy for the AI Head of Growth & Partnerships System

## Core Strategic Decision

The MVP-first approach was intentionally chosen to avoid building:
- fake autonomy
- overengineered systems
- orchestration theater
- shallow AI agents
- unreliable workflows
- huge maintenance burden
- complexity without operational value

The goal is NOT to build:
"AGI that runs a company."

The goal IS to build:
"A genuinely useful operational AI workspace usable daily right now."

This distinction changes everything.

---

# The Core MVP Operational Loop

The MVP validates this operational workflow:

```
Business Intake (operator submits profile)
↓
Intake Agent — extracts ICP, positioning, growth brief
↓
Discovery Agent — identifies partnership opportunities (memory-enriched)
↓
Research Agent — enriches each opportunity (parallel)
↓
Scoring Agent — qualifies and scores each lead (memory-enriched, parallel)
↓
Human checkpoint — operator reviews score + rationale, approves or rejects
↓
Outreach Agent — drafts personalized copy per channel + tone (memory-enriched)
↓
Human checkpoint — operator reviews draft, approves, marks sent
↓
Memory Agent — institutional knowledge persists across runs
↓
Analytics Agent — AI-generated insights from pipeline metrics
↓
Orchestration Visibility — live agent state in real time
```

If this loop works well:
- the product already provides leverage
- the AI colleagues feel believable
- the orchestration feels operational
- the system becomes genuinely useful

Only after validating this foundation should more advanced systems be introduced.

---

# What the MVP Currently Includes

This is what has been implemented as of the current build.

## Core Pipeline

- **Business Intake** — form with name, website URL, description
- **Intake Agent** — Zod-validated output: ICP, positioning, growth brief; hardened anti-hallucination prompt
- **Discovery Agent** — memory-enriched opportunity identification (top-5 semantic memories injected)
- **Research Agent** — company enrichment per opportunity, parallel execution
- **Scoring Agent** — fit scoring (0–100) + rationale + estimated impact, memory-enriched per company, parallel execution
- **Outreach Agent** — personalized draft generation with operator-selected channel (email / LinkedIn / cold call) and tone (professional / casual / bold), memory-enriched
- **Memory Agent** — semantic memory storage and retrieval (pgvector, 1536-dim embeddings, cosine similarity)
- **Analytics Agent** — AI-generated performance insights from daily pipeline metric snapshots

## Human Approval Infrastructure

- Opportunity approve / reject per card
- Expandable score rationale panel on each opportunity
- Outreach draft review queue (approve / mark sent)
- No autonomous sending — all execution gates require human confirmation

## Memory System

- `memory_entries` table in Supabase PostgreSQL
- OpenAI `text-embedding-3-small` embeddings generated on entry creation
- pgvector `search_memories_by_similarity` RPC for semantic retrieval
- Memory injected into Discovery, Scoring, and Outreach agents before generation
- Manual entry form in the Memory page
- Company-specific retrieval (`getRelevantMemoriesByCompany`)

## Observability

- `ai_runs` record per agent execution (status, duration_ms, tokens_used, input, output, error)
- `agent_logs` for step-level messages within each run (info / warning / error)
- Orchestration page with live React Flow agent graph:
  - 7 identity cards (role title, department, abstract geometric avatar per agent type)
  - Live state: idle / queued / executing / completed / failed
  - Presence indicators: breathing pulse ring + thinking dots when executing
  - Real-time activity text from `agent_logs`
  - Bezier communication trail edges with animated dash strokes
  - Supabase Realtime subscription (`postgres_changes` on `ai_runs` and `agent_logs`)
- Activity feed with live log streaming

## Dashboard & UI

- Dashboard: pipeline metrics, activity feed, recent agent runs
- Intake: business profile submission
- Opportunities: scored opportunity list with rationale
- Outreach: draft queue, approval, send tracking
- Memory: semantic search + browse + manual entry
- Analytics: AI insights + snapshot history + on-demand generation
- Orchestration: live agent workflow visualization
- Settings page

## Infrastructure

- Next.js 16.2.6 App Router Server Actions coordinate the pipeline
- In-memory sliding window rate limiter per agent action (per client IP key)
- Input sanitization before prompt injection (`sanitizeForPrompt`)
- `revalidatePath` cache invalidation on all mutations
- Pluggable AI provider with mock mode for local development (no credentials required)
- Configurable LLM: OpenAI (default) or Anthropic Claude via `AI_PROVIDER` env

---

# What Was Intentionally Left Out of the MVP

## 1. Fully Autonomous Execution

Deferred:
- autonomous email sending (Lemlist, Instantly, Gmail API)
- autonomous campaign launching
- autonomous ad spend management
- autonomous CRM changes
- autonomous partnership negotiation

Reason:
- hallucination risk in brand-sensitive communications
- reliability concerns without mature evaluation
- trust calibration not yet established

Current philosophy:

```
AI drafts → Human approves → Human executes
```

NOT: AI decides and sends autonomously.

---

## 2. External Research APIs

Deferred:
- Firecrawl / Browserbase web crawling
- Perplexity API for live market research
- SerpAPI, Apollo.io, Crunchbase, Similarweb

Reason:
- adds significant cost and reliability surface area
- MVP research quality from LLM training data is sufficient to validate the pipeline
- worth adding once the pipeline is proven and the bottleneck is research depth, not workflow correctness

---

## 3. Advanced Multi-Agent Self-Improvement

Deferred:
- agents rewriting prompts automatically
- self-healing orchestration
- recursive agent evolution
- autonomous optimization loops

Reason:
- instability risk
- requires mature evaluation systems first
- requires sufficient historical data to optimize against

The MVP prioritizes determinism, reliability, and operational clarity over self-modification.

---

## 4. Enterprise-Scale Orchestration Infrastructure

Deferred:
- Temporal for durable long-running workflows
- Kafka-scale event streaming
- Kubernetes-native orchestration
- Distributed task queues

Reason:
- premature infrastructure complexity
- Next.js Server Actions handle the current pipeline volume without additional services

The current rate limiter is in-memory (single-instance). Moving to Redis-backed rate limiting is the first infrastructure upgrade needed before multi-instance deployment.

---

## 5. Continuous Web Crawling

Deferred:
- autonomous competitor monitoring
- continuous market scanning
- auto-triggered discovery on external signals

Reason:
- high noise-to-signal ratio without mature evaluation
- human-triggered discovery is sufficient for MVP validation

---

## 6. Advanced Memory Evolution

Partially implemented (foundation only). Deferred:
- automatic memory creation from pipeline events (e.g., write memory when outreach is sent)
- memory confidence scoring
- autonomous pruning of stale or contradicted memories
- memory graph relationships

The embedding and retrieval infrastructure is in place. The automation on top of it is deferred.

---

## 7. Autonomous CRM & Sales Operations

Deferred:
- CRM connector integrations
- autonomous deal stage movement
- automated follow-up sequencing
- pipeline optimization triggers

Reason:
- requires business-specific operational logic
- requires mature approval guardrails
- high blast radius if wrong

---

## 8. Advanced AI Evaluation Systems

Deferred:
- reinforcement learning from approval decisions
- automated prompt quality optimization
- A/B evaluation of agent outputs

Reason:
- MVP focuses on operational usability first
- human approval decisions as feedback signal is sufficient initially

---

## 9. Authentication & Multi-Tenancy

Deferred:
- user authentication (currently hardcoded `MOCK_ORG_ID`)
- multi-tenant isolation
- organization-level RBAC
- enterprise governance (SOC2, audit logs, compliance)

Reason:
- validating single-operator leverage before adding auth complexity
- `MOCK_ORG_ID` is the first thing to replace when moving to production

---

## 10. Predictive Strategic Intelligence

Deferred:
- predictive partnership forecasting
- autonomous market prediction
- AI-generated strategic roadmaps

Reason:
- requires extensive historical data (months of runs)
- requires mature evaluation to validate predictions

---

## 11. Broad Integration Ecosystem

Deferred:
- n8n / Make.com workflow automation
- Slack / Notion integrations
- hundreds of CRM / tool connectors
- ERP integrations

Reason:
- operational simplicity matters more than breadth at MVP stage
- integrations add maintenance surface area before the core workflow is validated

---

## 12. Advanced Human Collaboration

Deferred:
- multi-user orchestration
- team collaboration layers
- organization-wide permission roles

Reason:
- validating single-operator leverage first
- multi-user introduces coordination complexity that obscures whether the core AI loop is working

---

# Why This Was the Correct Decision

This strategy produced:
- a working product with a complete end-to-end AI pipeline
- believable AI colleagues with real observability
- genuine operational leverage across the full growth workflow
- maintainable architecture with clear extension points
- reliable execution with human quality control at every gate

Without:
- fake AGI or orchestration theater
- infrastructure that outgrew the problem
- shallow agents that produce generic outputs

The result is a system that already provides real leverage — and a foundation where each deferred item is an independent upgrade, not a prerequisite for the whole thing to work.
