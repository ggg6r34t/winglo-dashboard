# Enterprise AI Systems Audit — Winglo Growth Agent
**Date:** 2026-05-12  
**Auditor:** Principal AI Systems Architect  
**Verdict:** Late Prototype / Pre-MVP — 6 of 8 core workflows are genuine, 4 subsystems are fake or unused

---

## 1. Executive Summary

### Current Maturity
**Late Prototype.** The platform has solid engineering foundations (schema, provider abstraction, type safety, rate limiting) but several critical subsystems that appear operational are actually decorative or hallucinatory. The system can plausibly demo. It cannot yet be used daily.

### Biggest Architectural Weaknesses
1. **Research Agent is a hallucination engine** — it instructs an LLM to "be factual" while giving it zero tools to verify facts. Every `partner_program_exists`, `notable_customers`, and `existing_integrations` field is invented.
2. **Vector memory is infrastructure theater** — `embedding VECTOR(1536)` column, IVFFlat index, and pgvector extension all exist. Nothing ever writes an embedding. Nothing ever queries by similarity. Memory context injection uses the last 5 arbitrary entries as flat text.
3. **No authentication layer** — `MOCK_ORG_ID` is hardcoded in every server action and DAL file. In "real mode," every user sees the same org's data. RLS policies exist but the `set_org_context()` function is never called from DAL code.
4. **Analytics snapshots never generated** — 90 days of mock fixture data exists. In real mode, the `analytics_snapshots` table is empty. No cron, no trigger, no generation action.
5. **Agent logs table is a ghost** — `createAgentLog()` is implemented but called nowhere in any agent workflow. The `agent_logs` table collects zero rows.
6. **No agent autonomy** — Every step requires a human button click. The "agentic" chain is a manually-triggered linear sequence. No planning, no self-correction, no goal pursuit.

### MVP Readiness Verdict
**Not yet usable in production.** Usable for demos and prototyping. Requires auth, real memory retrieval, grounded research, and snapshot generation before daily use.

---

## 2. Real vs Fake Functionality

| Feature | Status | Notes |
|---|---|---|
| Intake form → AI analysis | **REAL** | Works in real mode with OpenAI |
| Discovery agent chain | **REAL** | Runs, produces structured output |
| Research enrichment | **FAKE** | LLM invents company data, no web access |
| Scoring per opportunity | **REAL** | 4-dimension score is genuine |
| Opportunity approve/reject | **REAL** | DB writes, page revalidation |
| Outreach draft generation | **REAL** | Works, but no UI trigger on opportunity cards |
| Outreach send | **MISSING** | Draft created, no email/LinkedIn API |
| Memory write (manual notes) | **REAL** | AI extraction works |
| Memory injection into agents | **SHALLOW** | Last 5 flat-text entries, no semantic search |
| Vector similarity search | **FAKE** | Column + index exist, never queried |
| Analytics display | **REAL** (mock data) | Shows mock fixture data in mock mode |
| Analytics snapshot generation | **MISSING** | No generation mechanism in real mode |
| Agent run tracking | **REAL** | AIRun lifecycle complete |
| Agent step logging | **MISSING** | Table exists, nothing writes to it |
| Multi-org / auth | **MISSING** | Hardcoded MOCK_ORG_ID |
| Settings page | **EMPTY** | Shell only |
| Background job processing | **MISSING** | All AI runs in request lifecycle |

---

## 3. Phase 1 — Agent Architecture Findings

### Orchestration Model
The system uses a **linear synchronous chain**, not an orchestrator-agent model. `runDiscovery` is a sequential `await` chain: Discovery → Research (parallel) → Scoring (parallel) → persist. There is no:
- Planning step
- Conditional routing based on output quality
- Self-correction loop
- Agent-to-agent communication protocol
- Quality gate that re-runs discovery if 0 opportunities are found

### Agent Isolation
Good. Each agent has an isolated prompt, schema, and `formatInput`. Agents don't share state directly — data flows through the calling action.

### Failure Handling
Adequate. The catch block tracks `activeRun` and marks the correct run failed. `revalidatePath` is called post-success. However: if the server process dies mid-run, the run stays `running` forever (no timeout, no heartbeat recovery).

### Sub-agent Quality
- **Intake**: Solid. Single-purpose, clear output.
- **Discovery**: Adequate. No hallucination constraint on company names.
- **Research**: **Broken.** LLM has no ability to verify the data it returns.
- **Scoring**: Strong. 4-dimension framework with rationale is good.
- **Outreach**: Best prompt in the system. Specific rules, persona, word limits.
- **Memory**: Adequate. Well-scoped.
- **Analytics**: Adequate. Metrics context is passed, insights are valid.

---

## 4. Phase 2 — System Prompt Findings

### Intake Agent
**Weakness:** "Be specific and data-driven. Avoid generic statements." is advice without enforcement. No examples, no output format hints beyond the schema. LLM may produce generic ICP even with this instruction.

### Discovery Agent
**Critical weakness:** "Return 5–10 high-quality opportunities" with no constraint on grounding. An LLM can hallucinate companies ("PartnerCo" that doesn't exist). No instruction to only suggest real, verifiable companies. No instruction to explain *why* each company fits the specific ICP.

### Research Agent  
**Fatal flaw:** The prompt says "Be factual and specific. Do not invent data. If you don't know something, say so." — but the LLM cannot access the web. It will confidently state `partner_program_exists: true` based on training data that may be 2+ years old. The entire agent is built on a false premise.

### Scoring Agent
**Adequate.** Clear 4-dimension framework. Well-structured. Minor improvement: add instruction to explain *how confident* the score is given available information.

### Outreach Agent
**Strong.** Specific rules ("Keep emails under 250 words", "Write like a senior BD person"), channel-aware, tone-aware. Best prompt in the system.

### Memory Agent
**Adequate.** Clear extraction task. Could add: "If the notes don't contain actionable information worth recalling, return entry_type: 'observation' with a brief summary."

### Analytics Agent
**Weak.** Has no domain context about what thresholds are meaningful. An agent looking at "response_rate: 0.12" has no idea if 12% is good or bad for this business category.

---

## 5. Phase 4 — Memory System Findings

### Vector Infrastructure
- **VECTOR(1536) column**: exists ✅
- **IVFFlat index**: exists ✅  
- **Embedding generation**: ❌ never called
- **Similarity query**: ❌ never executed

### Memory Injection
Currently: `orgMemories.slice(0, 5)` passed to Discovery as flat text. This injects arbitrary recent memories, not relevant ones. If the org has 100 memory entries about HubSpot, and the discovery is for a company in a different space, the injected context is noise not signal.

### Memory Feedback Loop
None. Memories written after a run do not influence future runs until the user manually runs discovery again.

### Memory Coverage
Memory is only injected into the Discovery Agent. Scoring and Outreach agents receive zero memory context — they don't know if this company was contacted before, what the relationship history is, or what previous interactions revealed.

---

## 6. Phase 5 — Workflow Orchestration Findings

### Synchronous Blocking
All AI runs execute synchronously inside the HTTP request. A full discovery chain (Discovery + N×Research + N×Scoring) can take 30–120 seconds. The server holds the HTTP connection open for this entire time. In production, this will hit:
- Vercel function timeout (10s default, 30s max on Pro)
- Browser HTTP timeout
- User navigation away breaking the chain silently

### No Queue / Background Processing
No BullMQ, no Inngest, no Trigger.dev, no Vercel Cron. All processing is request-bound.

### Analytics Snapshot Gap
`analytics_snapshots` is populated in mock mode by a fixture generator. In real mode it's empty. There's no scheduled job, no trigger, and no manual generation button. The analytics page will show empty state for any real user.

### Stuck Runs
If a run gets stuck in `running` status (server crash, timeout), it stays `running` indefinitely. No TTL, no timeout cleanup.

---

## 7. Phase 7 — UI/UX Operational Findings

### What Works Well
- Clean page structure, clear navigation
- Status badges with correct colors
- Opportunity filtering by status/score
- Activity feed on dashboard

### What's Missing
1. **No "Generate Draft" button on OpportunityCard** — Users approve an opportunity then must navigate to /outreach separately. There's no direct trigger from the opportunity to generate outreach.
2. **No opportunity detail view** — Score rationale, company description, research notes are stored in the DB but not displayed anywhere.
3. **No discovery re-run trigger** — Once opportunities are approved/rejected, there's no "Run new discovery" button without going back to intake.
4. **No progress feedback during discovery** — The "Discovering..." spinner gives no indication of which phase is running (Discovery → Research × N → Scoring × N).
5. **Settings page is empty** — Users cannot update their business profile or org settings.
6. **Outreach channel/tone not configurable from UI** — `generateOutreachDraft` accepts channel and tone params but there's no selector in the UI.

---

## 8. Phase 9 — Production Risk Findings

### Authentication
**Critical.** No auth. No session. `MOCK_ORG_ID` hardcoded in every action and DAL file. In real mode, switching from mock to real would expose all data from org `00000000-0000-0000-0000-000000000001` to every visitor.

### `createOrgScopedClient` Never Called
`lib/supabase/server.ts` has `createOrgScopedClient(orgId)` which calls `set_org_context`. Every DAL function calls `createServiceClient()` instead. RLS policies that depend on `current_setting('app.current_org_id')` are never receiving the org context. In production, all DAL calls bypass RLS.

### Agent Logs Not Written
`createAgentLog` is implemented but unused. There is no observability into what agents are doing inside their runs beyond status/tokens/duration.

---

## 9. MUST-FIX Before Real Usage

| Priority | Finding | Impact |
|---|---|---|
| P0 | Authentication — hardcoded org | Security: any user sees all data |
| P0 | DAL never calls createOrgScopedClient — RLS bypassed | Security: org isolation broken |
| P1 | Research Agent hallucinates company data | Quality: all research data is unreliable |
| P1 | Vector memory never used | Quality: memory system is decorative |
| P1 | Analytics snapshots never generated | Feature: analytics always empty in real mode |
| P2 | No "Generate Draft" UI trigger | UX: key workflow requires navigation workaround |
| P2 | Agent logs never written | Observability: cannot debug agent behavior |
| P2 | Memory not injected into Scoring/Outreach | Quality: agents operate without relationship context |
| P3 | Synchronous long-running AI chains | Reliability: timeouts in production |
| P3 | Stuck runs have no cleanup | Operations: manual DB intervention required |
