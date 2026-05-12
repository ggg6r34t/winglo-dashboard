# Operational AI Growth System

An AI-powered Head of Growth & Partnerships system built around one core architectural decision:

> The agents are not generic assistants.
> Each agent has a defined role, a specific output schema, and memory context.

The system behaves like a real growth team: the intake analyst understands the business, the discovery coordinator finds opportunities, specialists research and qualify them, and the outreach agent drafts copy for human review. Everything is observable in real time.

---

# Architecture Overview

Seven specialized agents operate as a sequential pipeline. Memory context is injected at the stages where relationship history matters most — discovery, scoring, and outreach.

```
Business Intake
→ Intake Agent      (ICP extraction, positioning, growth brief)
→ Discovery Agent   (opportunity identification — memory-enriched)
→ Research Agent    (company enrichment — parallel per opportunity)
→ Scoring Agent     (fit qualification — memory-enriched, parallel)
→ Opportunities saved to DB
→ Outreach Agent    (draft generation — human-triggered, memory-enriched)
→ Memory Agent      (institutional knowledge — manual + automatic)
→ Analytics Agent   (performance insights — human-triggered)
```

Human checkpoints at two mandatory gates: opportunity approval/rejection, and outreach draft review before send.

---

# Layer 1 — Core Pipeline Orchestrator

**Implemented stack:**
- Next.js 16.2.6 App Router Server Actions coordinate the full pipeline
- Zod structured output schemas enforce typed generation for every agent
- Sequential execution with parallel fan-out for research and scoring
- `ai_runs` + `agent_logs` tables provide full execution telemetry per agent step

**The orchestrator is not a separate service.** Server Actions call agents in sequence, pass outputs forward, and write observability records. This is deliberate — the MVP prioritizes operational clarity over distributed complexity.

**Future consideration:** As the pipeline grows (parallel discovery runs, autonomous triggers, retry logic), migrating the orchestration layer to Temporal or a similar durable workflow engine would be appropriate.

---

# Layer 2 — Memory & Intelligence Layer

**Implemented stack:**
- Supabase PostgreSQL — `memory_entries` table with typed entry types
- pgvector — 1536-dimensional cosine similarity search via `search_memories_by_similarity` RPC
- OpenAI `text-embedding-3-small` — embedding generation (fire-and-forget on memory creation)

**Memory types stored:**
- Partner intelligence
- ICP updates
- Campaign learnings
- Outreach learnings
- Meeting summaries

**Memory injection points in the pipeline:**

| Agent | Query | Top-K |
|---|---|---|
| Discovery | Business profile + ICP + partnership categories | 5 |
| Scoring | Target company name | 3 |
| Outreach | Target company name | 3 |

**Example of what memory enables:**
```
"We already contacted this company 3 months ago."
"This municipality cares about sustainability metrics."
"Integration-type partnerships have the highest response rate."
```

**Not yet implemented:** Pinecone/Weaviate as a separate vector store. The pgvector integration inside Supabase handles the MVP's memory retrieval requirements without an additional service dependency.

---

# Layer 3 — Research & Enrichment Layer

**Implemented:**
- Research Agent enriches each discovered opportunity with company intelligence using the LLM's knowledge
- Runs in parallel per opportunity within the discovery pipeline

**Deferred:**
- Firecrawl / Browserbase web crawling
- Perplexity, SerpAPI, Apollo, Crunchbase, Similarweb API integrations
- Continuous competitor monitoring loops

The current research layer operates within the LLM's training data. External live data APIs are the highest-value next investment once the core pipeline is validated, as they directly improve the quality of enrichment for companies the model doesn't know well.

---

# Layer 4 — Specialized Growth Agents

Seven agents are implemented. All are observable in real time on the Orchestration page as AI colleague identity cards.

---

## 1. Intake Agent — Business Analyst
**Department:** Intelligence Intake

Analyzes a submitted business profile and extracts structured growth intelligence that every downstream agent uses.

**Output (Zod-validated):**
- ICP: company size, industry, role, pain points, budget range
- Positioning: value proposition, differentiators, competitors, category
- Growth brief: summary, opportunities, recommended channels, partnership categories

**Constraints:** hardened system prompt with specificity requirements and anti-hallucination rules (e.g., "200–1000 employee SaaS companies with Salesforce" not "B2B SaaS companies").

---

## 2. Discovery Agent — Discovery Coordinator
**Department:** Opportunity Intelligence

Identifies strategic partnership opportunities using the business profile, ICP, and top-5 semantically similar memory entries.

**Output:** list of opportunities with company name, URL, type, and rationale.

---

## 3. Research Agent — Research Analyst
**Department:** Market Research

Enriches each discovered opportunity with detailed company intelligence. Runs in parallel per opportunity inside the discovery pipeline.

**Output:** enriched company description passed to scoring.

---

## 4. Scoring Agent — Evaluation Analyst
**Department:** Lead Qualification

Scores each enriched opportunity for fit and estimated impact, incorporating relationship history from memory. Runs in parallel per opportunity.

**Output (Zod-validated):**
- Score (0–100)
- Score rationale (displayed as expandable panel on the Opportunities page)
- Estimated impact statement

---

## 5. Outreach Agent — Outreach Specialist
**Department:** Growth & Outreach

Generates personalized outreach copy for human-approved opportunities. Channel (email, LinkedIn, cold call) and tone (professional, casual, bold) are selected by the operator before triggering.

**Output:** subject line (email only) + body copy, informed by relationship memory.

**Human approval gate:** drafts queue for review — humans approve or reject before marking sent.

---

## 6. Memory Agent — Knowledge Manager
**Department:** Memory & Knowledge

Manages institutional memory storage and semantic retrieval.

**Implemented:**
- Manual memory entry form (UI)
- Automatic embedding generation on entry creation (fire-and-forget)
- Semantic similarity search (pgvector RPC)
- Company-specific recall (`getRelevantMemoriesByCompany`)

**Deferred:** automatic memory creation from pipeline events (e.g., writing a memory entry when an outreach is sent), memory pruning, confidence scoring.

---

## 7. Analytics Agent — Analytics Director
**Department:** Performance Analytics

Generates AI-powered performance analysis from pipeline metric snapshots.

**Output (Zod-validated):**
- Summary paragraph
- 3–5 specific insights
- 3–5 actionable recommendations
- Highlight metric (label, value, trend direction)

**Data source:** `analytics_snapshots` table — daily metrics (opportunities discovered, scored, approved, outreach sent, response rates).

---

# Layer 5 — Automation Layer

**Implemented:**
- Next.js Server Actions coordinate the pipeline end-to-end
- Supabase Realtime (`postgres_changes` on `ai_runs` and `agent_logs`) streams state to the UI without polling
- `revalidatePath` invalidates the Next.js cache on pipeline mutations

**Deferred:**
- n8n / Make.com for external workflow automation
- Temporal for durable long-running workflows with retries
- Webhook-driven external triggers (e.g., CRM deal stage change → auto-trigger discovery)

---

# Layer 6 — Human Approval Layer

Two approval gates are enforced in the current system:

```
Opportunities discovered
→ Operator reviews score + rationale
→ Approves or rejects each opportunity

Outreach draft generated (operator-triggered)
→ Operator reviews draft copy
→ Approves
→ Marks as sent
```

**Not autonomous:**
- Email sending (no Lemlist/Instantly/Gmail API integration)
- CRM deal movement
- Campaign launching or ad spend

The system generates and drafts. Humans decide and execute. This is a deliberate constraint, not a limitation to work around.

---

# Layer 7 — Operational Dashboard

**Implemented with:**
- Next.js 16.2.6 App Router, React 19, TypeScript
- Tailwind v4 with CSS custom property design token system
- Framer Motion v12 for animations
- @xyflow/react v12 for the orchestration graph

**Pages:**

| Page | What it shows |
|---|---|
| Dashboard | Pipeline metrics, activity feed, recent agent run history |
| Intake | Business profile form (name, website, description) |
| Opportunities | Scored opportunities, expandable score rationale, approve/reject |
| Outreach | Draft generation with channel + tone selectors, approval queue, sent tracking |
| Memory | Semantic search, manual entry form, knowledge base browse |
| Analytics | AI-generated insights, performance snapshot history, generate on demand |
| Orchestration | Live agent workflow visualization |
| Settings | Configuration |

**Orchestration page — AI colleague visualization:**
- 7 identity cards: role title, department label, abstract geometric SVG avatar
- Live state rings: idle / queued / executing / completed / failed
- Presence indicators: breathing pulse ring + animated thinking dots when executing
- Activity text pulled from live `agent_logs` in real time
- Bezier edge communication trails with flowing animated dash strokes
- Supabase Realtime subscription — no polling

This was deliberately designed to feel like a live team, not a workflow diagram.

---

# Layer 8 — Continuous Learning Loop

**Foundation implemented:**
- Every agent execution writes an `ai_runs` record (status, duration, tokens, input, output)
- Step-level `agent_logs` record what happened inside each run
- Memory entries persist institutional knowledge across runs
- Scoring and Outreach agents receive memory context before generating output
- Analytics agent reads pipeline snapshots to surface what's working

**Deferred:**
- Reinforcement learning from approval decisions
- Automatic memory creation from pipeline events
- Autonomous prompt evolution
- Memory confidence scoring and pruning

The data accumulation is happening now. The automated feedback loop that acts on it is a post-MVP investment.

---

# Current Tech Stack

## Framework
- Next.js 16.2.6 (App Router, React 19, TypeScript)
- Tailwind v4 (CSS custom properties, no shadcn/ui)

## AI
- OpenAI (default) or Anthropic Claude — configurable via `AI_PROVIDER` env var
- OpenAI `text-embedding-3-small` for memory embeddings
- Zod structured output schemas per agent
- Pluggable `AIProvider` interface — mock mode for local development without credentials

## Database & Memory
- Supabase PostgreSQL
- pgvector (1536-dimensional embeddings, cosine similarity)
- `search_memories_by_similarity` Supabase RPC

## Real-time
- Supabase Realtime (`postgres_changes` on `ai_runs` and `agent_logs`)

## Frontend State
- Zustand v5 (orchestration store)
- @xyflow/react v12 (agent graph)
- Framer Motion v12 (animations)

## Testing
- Vitest + @testing-library/react

## Rate Limiting
- In-memory sliding window rate limiter (per client IP key)
- Known limitation: not effective across multiple server instances or serverless deployments — needs Redis for production scale

## Monitoring
- Agent observability via `ai_runs` + `agent_logs` tables (built-in)
- Orchestration visualizer for real-time workflow state

## Not yet integrated
- LangGraph / CrewAI / LangChain
- Firecrawl, Browserbase, Perplexity, Apollo, Crunchbase
- n8n, Make.com, Temporal
- PostHog, Sentry, LangSmith
- Lemlist, Instantly, Gmail API
- CRM connectors

---

# Most Important Insight

The moat is not the LLM model choice.

```
institutional memory
+ agent observability
+ accumulated pipeline intelligence
+ human-in-the-loop quality control
+ execution reliability
```

That is what makes it feel like a real AI growth team instead of a chatbot that drafts emails. The system improves every time the pipeline runs — not because the model changes, but because the memory layer grows.
