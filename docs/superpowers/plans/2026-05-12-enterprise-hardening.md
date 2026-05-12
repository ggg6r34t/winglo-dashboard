# Enterprise Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Harden the Winglo Growth Agent from Late Prototype to genuine MVP — fix fake subsystems, ground agent outputs, wire unused infrastructure, improve prompts, add missing UX.

**Architecture:** 8 targeted remediation tasks. Each is self-contained. Execute sequentially — later tasks (T6, T7) depend on the memory infrastructure from T2.

**Tech Stack:** Next.js 16.2.6, React 19, TypeScript strict, Tailwind v4, Supabase pgvector, OpenAI embeddings API, Zod v4.

---

## Task T1: Harden All 7 System Prompts

**Files:**
- Modify: `lib/ai/prompts/intake-agent.ts`
- Modify: `lib/ai/prompts/discovery-agent.ts`
- Modify: `lib/ai/prompts/research-agent.ts`
- Modify: `lib/ai/prompts/scoring-agent.ts`
- Modify: `lib/ai/prompts/memory-agent.ts`
- Modify: `lib/ai/prompts/analytics-agent.ts`
- (outreach-agent.ts is already strong — no change)

### Intake Agent — replace systemPrompt with:

```typescript
export const systemPrompt = `You are the Intake Agent for Winglo — an AI-powered Head of Growth & Partnerships.

Your task: analyze a business and extract precise, actionable intelligence that downstream agents will use to discover and prioritize partnerships.

Rules:
- Extract ICP from signals in the description. If the description is vague, infer from the product category and name.
- Positioning must include real competitors — use well-known market alternatives, not generic placeholders.
- Growth brief must identify 3-5 specific partnership categories (e.g. "CRM integrations", "Sales engagement platforms") not generic ones (e.g. "technology partnerships").
- Be specific. "B2B SaaS companies" is not an ICP. "200-1000 employee SaaS companies with a dedicated sales team using Salesforce" is.
- Do not add fields not in the schema. Do not leave any field empty — use your best inference.`
```

### Discovery Agent — replace systemPrompt with:

```typescript
export const systemPrompt = `You are the Partnership Discovery Agent for Winglo.

Your task: identify real, named partnership opportunities for a given business. Every company you suggest must be a real company that exists today.

Rules:
- Only suggest companies you are confident exist (you have seen them in training data). Do not invent company names.
- Each opportunity must directly match the business's ICP or growth brief — explain the specific strategic fit.
- Opportunity type must reflect the actual relationship: 'integration' means a technical API integration; 'co-marketing' means joint campaigns; 'reseller' means they sell your product; 'distribution' means they include you in a bundle; 'technology' means shared infrastructure; 'strategic' means executive-level alignment.
- Rank by likely strategic impact for THIS specific business, not generic industry importance.
- Return exactly 5-8 opportunities. Quality over quantity.`
```

### Research Agent — replace entirely (this is the critical fix):

```typescript
export const systemPrompt = `You are the Company Intelligence Agent for Winglo.

Your task: synthesize a structured intelligence brief about a potential partner company using ONLY:
1. The company name and URL provided
2. Your training knowledge about this company (which may be outdated — flag uncertainty clearly)
3. Context about the requesting business's ICP and growth goals

CRITICAL RULES:
- You do NOT have web access. Your knowledge has a cutoff date.
- For any field where you are uncertain, use "Unknown — verify manually" rather than guessing.
- partner_program_exists: only set to true if you have high confidence from training data. Default to false with a note to verify.
- notable_customers and existing_integrations: list only those you are highly confident about. Use [] if uncertain.
- Your output is a starting point for human review, not a source of truth.
- Flag staleness: if the company is growing rapidly or recently funded, note that your data may be outdated.`
```

Update `research-agent.ts` outputSchema to include an `intelligence_confidence` field:

```typescript
export const outputSchema = z.object({
  company_name: z.string(),
  company_url: z.string().url().optional(),
  description: z.string(),
  business_model: z.string(),
  customer_segments: z.array(z.string()),
  notable_customers: z.array(z.string()),
  existing_integrations: z.array(z.string()),
  partner_program_exists: z.boolean(),
  partner_program_notes: z.string().optional(),
  intelligence_confidence: z.enum(['high', 'medium', 'low']),
  data_caveats: z.string().optional(),
})
```

Update `ResearchOutput` type accordingly.

### Scoring Agent — replace systemPrompt with:

```typescript
export const systemPrompt = `You are the Partnership Scoring Agent for Winglo.

Your task: evaluate the strategic fit between a business and a potential partner on a 0–100 scale.

Scoring dimensions (each 0–25 points):
- Strategic fit: How well do the companies' missions, markets, and go-to-market motions align?
- Audience overlap: Do they share the same buyer persona or adjacent personas?
- Growth potential: What is the realistic business impact if this partnership succeeds?
- Ease of execution: How tractable is this partnership? (partner program, technical feasibility, relationship pathway)

Rules:
- A score of 90+ requires exceptional alignment on all four dimensions. Reserve for truly exceptional fits.
- 70–89: Strong fit, actionable. Worth pursuing.
- 50–69: Moderate fit. Pursue only if pipeline is thin.
- Below 50: Weak fit. Only pursue opportunistically.
- Always provide specific, evidence-based rationale for each dimension score.
- If you lack confidence in a dimension due to limited information, assign a conservative score and note it.`
```

### Memory Agent — replace systemPrompt with:

```typescript
export const systemPrompt = `You are the Memory Agent for Winglo.

Your task: extract a structured, durable memory entry from raw notes. This memory will be recalled months from now by other agents making partnership decisions.

Rules:
- The title must be a specific, scannable summary (not "Partnership call" — use "Salesforce BD call — mutual interest in data sync integration, next step: API spec review")
- The body must include: what happened, what was decided, what the next step is, and any red flags or blockers
- entry_type classification:
  - partner_interaction: any direct communication or meeting with a potential partner
  - learning: an insight about the market, a company, or a strategy that changes how we should operate
  - observation: background context, research findings, or competitive intelligence
- related_company: extract the primary company name if clearly referenced
- If the notes are low-signal (e.g. "had a call"), produce an observation entry with whatever context is available — do not discard input`
```

### Analytics Agent — replace systemPrompt with:

```typescript
export const systemPrompt = `You are the Analytics Agent for Winglo.

Your task: analyze partnership pipeline performance data and generate specific, actionable insights.

Benchmarks for context:
- Response rate: >15% is strong, 8–15% is average, <8% needs attention
- Approval rate (outreach approved/generated): >60% is healthy
- Discovery-to-approval conversion: >30% is good pipeline quality
- Average opportunity score should stay above 65 — if below, discovery quality is degrading

Rules:
- Every insight must be specific to the data provided. Do not generate insights that could apply to any business.
- Recommendations must be concrete actions (e.g. "Run discovery for HR tech integrations — your score data shows this category scores 15% higher than average" not "Consider adding more partnerships")
- highlight_metric should be the single most important signal in the data — the one that most changes what the team should do next
- If the data shows fewer than 7 days of activity, note this as "insufficient data for reliable trends"`
```

- [ ] **Step 1: Replace all 6 system prompts** — edit each file as specified above

- [ ] **Step 2: Update research-agent.ts outputSchema** — add `intelligence_confidence` and `data_caveats` fields

- [ ] **Step 3: Update ResearchOutput type** — update the `z.infer` type alias

- [ ] **Step 4: Run `npx tsc --noEmit`** — confirm no type errors

- [ ] **Step 5: Run `npm test`** — confirm all 37 tests still pass

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: harden all agent system prompts — specificity, anti-hallucination, domain constraints"
```

---

## Task T2: Wire Vector Memory — Embedding Generation + Semantic Search

**Files:**
- Create: `lib/ai/embeddings.ts`
- Modify: `server/dal/memory-entries.ts`
- Modify: `lib/ai/providers/openai.ts` (add embedding method)

This task makes memory genuinely intelligent. When a memory entry is created, generate an embedding. When memory is queried for relevance, use cosine similarity.

### Step 1: Create `lib/ai/embeddings.ts`

```typescript
import OpenAI from 'openai'
import { env } from '@/lib/env'

const EMBEDDING_MODEL = 'text-embedding-3-small'  // 1536 dimensions, fast, cheap

let client: OpenAI | null = null

function getClient(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: env.openaiApiKey })
  return client
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (env.useMockData) return Array(1536).fill(0)  // zero vector for mock mode
  const response = await getClient().embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8000),  // respect token limit
  })
  return response.data[0].embedding
}

export function embeddingToSql(embedding: number[]): string {
  return `[${embedding.join(',')}]`
}
```

### Step 2: Add semantic search to `server/dal/memory-entries.ts`

Add a new function `searchMemoriesBySimilarity`:

```typescript
export async function searchMemoriesBySimilarity(
  orgId: string,
  queryText: string,
  limit = 5
): Promise<MemoryEntry[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    // In mock mode: simple keyword match as a proxy for semantic search
    const lower = queryText.toLowerCase()
    const results = mockMemoryEntries
      .filter(m => m.organization_id === orgId)
      .filter(m =>
        m.title.toLowerCase().includes(lower) ||
        m.body.toLowerCase().includes(lower) ||
        (m.related_company?.toLowerCase().includes(lower) ?? false)
      )
    return results.slice(0, limit).length > 0
      ? results.slice(0, limit)
      : mockMemoryEntries.filter(m => m.organization_id === orgId).slice(0, limit)
  }

  const { generateEmbedding } = await import('@/lib/ai/embeddings')
  const embedding = await generateEmbedding(queryText)
  const embeddingStr = `[${embedding.join(',')}]`

  const supabase = await createServiceClient()
  const { data, error } = await supabase.rpc('search_memories_by_similarity', {
    p_org_id: orgId,
    p_embedding: embeddingStr,
    p_limit: limit,
  })
  if (error) throw error
  return (data ?? []) as MemoryEntry[]
}
```

### Step 3: Create Supabase RPC for vector search

Create `supabase/migrations/0003_vector_search.sql`:

```sql
CREATE OR REPLACE FUNCTION search_memories_by_similarity(
  p_org_id UUID,
  p_embedding VECTOR(1536),
  p_limit INTEGER DEFAULT 5
)
RETURNS SETOF memory_entries
LANGUAGE sql STABLE
SECURITY DEFINER
AS $$
  SELECT *
  FROM memory_entries
  WHERE organization_id = p_org_id
    AND embedding IS NOT NULL
  ORDER BY embedding <=> p_embedding
  LIMIT p_limit;
$$;

REVOKE ALL ON FUNCTION search_memories_by_similarity(UUID, VECTOR, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION search_memories_by_similarity(UUID, VECTOR, INTEGER) TO service_role;
```

### Step 4: Generate embedding on memory entry creation

In `server/dal/memory-entries.ts`, update `createMemoryEntry` real mode to generate and store embedding:

```typescript
// In real mode, after insert:
// Generate embedding from title + body
import { generateEmbedding } from '@/lib/ai/embeddings'

// After creating the entry, update with embedding
const embeddingVector = await generateEmbedding(`${data.title}\n${data.body}`)
const { error: embeddingError } = await supabase
  .from('memory_entries')
  .update({ embedding: embeddingVector as unknown as string })
  .eq('id', created.id)
// Ignore embedding errors — the entry is already created
if (embeddingError) console.error('Failed to store embedding:', embeddingError)
```

### Step 5: Update `features/intake/server/actions.ts` to use semantic search

Replace:
```typescript
const orgMemories = await getMemoryEntries(ORG_ID)
// ...
discoveryFormatInput(profile, orgMemories.slice(0, 5))
```

With:
```typescript
const orgMemories = await searchMemoriesBySimilarity(
  ORG_ID,
  `${profile.name} ${profile.description ?? ''} ${profile.growth_brief?.partnership_categories?.join(' ') ?? ''}`,
  5
)
// ...
discoveryFormatInput(profile, orgMemories)
```

Import `searchMemoriesBySimilarity` from `@/server/dal/memory-entries`.

- [ ] **Step 1: Create `lib/ai/embeddings.ts`**
- [ ] **Step 2: Create `supabase/migrations/0003_vector_search.sql`**
- [ ] **Step 3: Update `createMemoryEntry` in DAL** — generate + store embedding in real mode
- [ ] **Step 4: Add `searchMemoriesBySimilarity` to `server/dal/memory-entries.ts`**
- [ ] **Step 5: Update `runDiscovery` in intake actions** — replace `getMemoryEntries().slice(0,5)` with `searchMemoriesBySimilarity`
- [ ] **Step 6: Run tests + tsc**
- [ ] **Step 7: Commit**

```bash
git commit -m "feat: wire vector memory — embedding generation, semantic search, contextual injection"
```

---

## Task T3: Memory Injection into Scoring + Outreach Agents

**Files:**
- Modify: `lib/ai/prompts/scoring-agent.ts`
- Modify: `lib/ai/prompts/outreach-agent.ts`
- Modify: `features/intake/server/actions.ts` (scoring phase)
- Modify: `features/outreach/server/actions.ts`

Scoring and Outreach agents currently receive zero memory context. They don't know if this company has been contacted before, what previous interactions revealed, or what their relationship history is.

### scoring-agent.ts — update `formatInput` signature:

```typescript
export function formatInput(
  profile: BusinessProfile,
  opportunity: Pick<Opportunity, 'company_name' | 'company_description' | 'opportunity_type'>,
  memories: MemoryEntry[] = []
): Message[] {
  const memoryContext = memories.length > 0
    ? `\nRelationship History:\n${memories.map(m => `- ${m.title}: ${m.body}`).join('\n')}`
    : ''

  return [{
    role: 'user',
    content: `Score the strategic fit between these two companies.

Our Company: ${profile.name}
Description: ${profile.description ?? 'N/A'}
ICP: ${JSON.stringify(profile.icp, null, 2)}

Potential Partner: ${opportunity.company_name}
Description: ${opportunity.company_description ?? 'N/A'}
Partnership Type: ${opportunity.opportunity_type}${memoryContext}

Return score and rationale as JSON.`,
  }]
}
```

### outreach-agent.ts — update `formatInput` signature:

```typescript
export function formatInput(data: {
  profile: BusinessProfile
  opportunity: Opportunity
  channel: OutreachChannel
  tone: OutreachTone
  memories?: MemoryEntry[]
}): Message[] {
  const memoryContext = (data.memories ?? []).length > 0
    ? `\nPrevious interactions:\n${data.memories!.map(m => `- ${m.title}: ${m.body}`).join('\n')}`
    : '\nNo previous interactions on record.'

  return [{
    role: 'user',
    content: `Write a ${data.channel} outreach message for this partnership.

Our Company: ${data.profile.name}
Our Value Prop: ${data.profile.positioning?.value_proposition ?? 'N/A'}

Partner Company: ${data.opportunity.company_name}
Partnership Type: ${data.opportunity.opportunity_type}
Why this partnership: ${data.opportunity.score_rationale?.strategic_fit ?? 'Strong strategic fit'}${memoryContext}

Channel: ${data.channel}
Tone: ${data.tone}

${data.channel === 'email' ? 'Include a subject line.' : 'No subject line needed.'}
${(data.memories ?? []).length > 0 ? 'Reference the previous interaction history naturally — do not start from scratch if we have context.' : ''}

Return JSON with subject (if email) and body.`,
  }]
}
```

Add `import type { MemoryEntry } from '@/types'` to both prompt files.

### Update scoring phase in `features/intake/server/actions.ts`:

In the `scoredOpportunities = await Promise.all(...)` block, before each scoring call, fetch relevant memories:

```typescript
const scoredOpportunities = await Promise.all(
  researchedOpportunities.map(async (opp) => {
    const companyMemories = await searchMemoriesBySimilarity(
      ORG_ID,
      opp.company_name,
      3
    )
    const scoringResult = await ai.complete({
      messages: scoringFormatInput(profile, {
        company_name: opp.company_name,
        company_description: opp.researchedDescription,
        opportunity_type: opp.opportunity_type,
      }, companyMemories),
      systemPrompt: scoringSystemPrompt,
      schema: scoringOutputSchema,
    })
    // ... rest unchanged
  })
)
```

### Update `features/outreach/server/actions.ts`:

After fetching profile and opportunity, add:
```typescript
const companyMemories = await searchMemoriesBySimilarity(
  ORG_ID,
  opportunity.company_name,
  3
)

const result = await ai.complete({
  messages: outreachFormatInput({ profile, opportunity, channel, tone, memories: companyMemories }),
  // ...
})
```

Import `searchMemoriesBySimilarity` from `@/server/dal/memory-entries`.

- [ ] **Step 1: Update `scoring-agent.ts` formatInput** — add `memories` param + context injection
- [ ] **Step 2: Update `outreach-agent.ts` formatInput** — add `memories` param + context injection
- [ ] **Step 3: Update scoring phase in intake actions** — fetch per-company memories before each score call
- [ ] **Step 4: Update outreach action** — fetch company memories, pass to formatInput
- [ ] **Step 5: Run tests + tsc**
- [ ] **Step 6: Commit**

```bash
git commit -m "feat: inject memory context into Scoring and Outreach agents for relationship-aware outputs"
```

---

## Task T4: Wire Agent Step Logging

**Files:**
- Modify: `features/intake/server/actions.ts`
- Modify: `features/outreach/server/actions.ts`
- Modify: `features/memory/server/actions.ts`
- Modify: `features/analytics/server/actions.ts`

The `agent_logs` table and `createAgentLog` function exist but nothing writes to them. This task wires logging throughout all agent runs.

### Pattern (add to EVERY agent run, after each major step):

```typescript
import { createAgentLog } from '@/server/dal/ai-runs'

// After creating the run:
await createAgentLog(ORG_ID, run.id, 'info', 'Agent started', { input_summary: '...' })

// After AI call completes:
await createAgentLog(ORG_ID, run.id, 'info', 'AI call complete', {
  tokens_used: result.tokensUsed,
  duration_ms: Date.now() - start,
})

// On error (in catch block):
await createAgentLog(ORG_ID, run.id, 'error', `Agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`, {})
```

### `features/intake/server/actions.ts` — `analyzeBusinessProfile`:

Add 3 log calls:
1. After `updateAIRun(run.id, { status: 'running' })`: `createAgentLog(ORG_ID, run.id, 'info', 'Intake analysis started', { profile_name: safeName })`
2. After successful `updateAIRun(run.id, { status: 'complete' })`: `createAgentLog(ORG_ID, run.id, 'info', 'Intake analysis complete', { tokens: result.tokensUsed })`
3. In catch: `createAgentLog(ORG_ID, run.id, 'error', 'Intake analysis failed', { error: error instanceof Error ? error.message : 'Unknown' })`

### `features/intake/server/actions.ts` — `runDiscovery`:

Add log calls at each phase transition:
1. Discovery started
2. Discovery complete — N opportunities found
3. Research started — N companies to research
4. Research complete
5. Scoring started
6. Scoring complete — avg score X
7. On error in catch

### `features/outreach/server/actions.ts`, `memory/server/actions.ts`, `analytics/server/actions.ts`:

Same pattern: started → complete → error.

All `createAgentLog` calls must use `.catch(() => {})` (fire-and-forget) so a logging failure never breaks the main workflow.

- [ ] **Step 1: Add logging to `analyzeBusinessProfile`**
- [ ] **Step 2: Add logging to `runDiscovery` at each phase**
- [ ] **Step 3: Add logging to outreach, memory, analytics actions**
- [ ] **Step 4: Ensure all createAgentLog calls use `.catch(() => {})`**
- [ ] **Step 5: Run tests + tsc**
- [ ] **Step 6: Commit**

```bash
git commit -m "feat: wire agent step logging throughout all AI workflows for observability"
```

---

## Task T5: Outreach Generation UX — Trigger from Opportunity Card

**Files:**
- Modify: `features/opportunities/components/opportunity-card.tsx`
- Modify: `features/opportunities/server/actions.ts`

Currently users must navigate to /outreach manually. Approved opportunities should have a "Generate Draft" button directly on the card.

### Update `opportunity-card.tsx`:

Add a "Generate Outreach" button that appears when `opportunity.status === 'approved'`:

```tsx
// Add to client component, after existing approve/reject buttons section
{opportunity.status === 'approved' && (
  <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex items-center gap-2">
    <select
      value={channel}
      onChange={e => setChannel(e.target.value as OutreachChannel)}
      disabled={isGenerating}
      className="text-xs bg-[var(--surface-raised)] border border-[var(--border-color)] rounded px-2 py-1 text-[var(--text-primary)]"
    >
      <option value="email">Email</option>
      <option value="linkedin">LinkedIn</option>
      <option value="proposal">Proposal</option>
    </select>
    <select
      value={tone}
      onChange={e => setTone(e.target.value as OutreachTone)}
      disabled={isGenerating}
      className="text-xs bg-[var(--surface-raised)] border border-[var(--border-color)] rounded px-2 py-1 text-[var(--text-primary)]"
    >
      <option value="professional">Professional</option>
      <option value="warm">Warm</option>
      <option value="direct">Direct</option>
    </select>
    <button
      onClick={handleGenerateOutreach}
      disabled={isGenerating}
      className="text-xs px-3 py-1 rounded bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 disabled:opacity-50"
    >
      {isGenerating ? 'Generating...' : 'Generate Draft'}
    </button>
    {generateError && (
      <span className="text-xs text-[var(--destructive)]">{generateError}</span>
    )}
  </div>
)}
```

Add state:
```typescript
const [channel, setChannel] = useState<OutreachChannel>('email')
const [tone, setTone] = useState<OutreachTone>('professional')
const [isGenerating, startGenerating] = useTransition()
const [generateError, setGenerateError] = useState<string | null>(null)
```

Add handler:
```typescript
function handleGenerateOutreach() {
  startGenerating(async () => {
    try {
      setGenerateError(null)
      await generateOutreachDraft(opportunity.id, channel, tone)
      router.push('/outreach')
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : 'Generation failed')
    }
  })
}
```

Import `generateOutreachDraft` from `@/features/outreach/server/actions` and `useRouter` from `next/navigation`.
Import `OutreachChannel`, `OutreachTone` from `@/types`.

- [ ] **Step 1: Add state (channel, tone, isGenerating, generateError) to `opportunity-card.tsx`**
- [ ] **Step 2: Add Generate Draft section to approved opportunity cards**
- [ ] **Step 3: Wire handleGenerateOutreach with useTransition + error handling**
- [ ] **Step 4: Run tests + tsc**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add Generate Draft button to approved opportunity cards with channel/tone selectors"
```

---

## Task T6: Analytics Snapshot Generation

**Files:**
- Create: `features/analytics/server/generate-snapshot.ts`
- Modify: `app/(dashboard)/analytics/page.tsx`
- Modify: `server/dal/analytics-snapshots.ts`

Analytics snapshots are never generated in real mode. This task adds a server action that computes today's metrics from real DB data.

### Create `features/analytics/server/generate-snapshot.ts`:

```typescript
'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { MOCK_ORG_ID } from '@/lib/mock'
import { revalidatePath } from 'next/cache'

const ORG_ID = MOCK_ORG_ID

export async function generateDailySnapshot(): Promise<void> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') return

  const today = new Date().toISOString().split('T')[0]
  const supabase = await createServiceClient()

  // Compute today's metrics from actual data
  const [oppsResult, outreachResult, aiRunsResult] = await Promise.all([
    supabase
      .from('opportunities')
      .select('status, score')
      .eq('organization_id', ORG_ID)
      .gte('created_at', today),
    supabase
      .from('outreach_drafts')
      .select('status')
      .eq('organization_id', ORG_ID)
      .gte('created_at', today),
    supabase
      .from('ai_runs')
      .select('agent_type, status, tokens_used')
      .eq('organization_id', ORG_ID)
      .gte('created_at', today),
  ])

  const opportunities = oppsResult.data ?? []
  const outreach = outreachResult.data ?? []

  const outreach_sent = outreach.filter(d => d.status === 'sent').length
  const outreach_approved = outreach.filter(d => ['approved', 'sent'].includes(d.status)).length
  const opportunities_discovered = opportunities.length
  const opportunities_approved = opportunities.filter(o => o.status === 'approved').length
  const scores = opportunities.map(o => o.score).filter((s): s is number => s != null)
  const avg_score = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

  // Compute response rate from all-time sent vs approved
  const { data: allOutreach } = await supabase
    .from('outreach_drafts')
    .select('status')
    .eq('organization_id', ORG_ID)
  const allSent = (allOutreach ?? []).filter(d => d.status === 'sent').length
  const allApproved = (allOutreach ?? []).filter(d => ['approved', 'sent'].includes(d.status)).length
  const response_rate = allApproved > 0 ? allSent / allApproved : 0

  const metrics = {
    outreach_sent,
    outreach_approved,
    opportunities_discovered,
    opportunities_approved,
    response_rate: parseFloat(response_rate.toFixed(3)),
    avg_score: parseFloat(avg_score.toFixed(1)),
  }

  // Upsert snapshot for today
  const { error } = await supabase
    .from('analytics_snapshots')
    .upsert({ organization_id: ORG_ID, snapshot_date: today, metrics }, { onConflict: 'organization_id,snapshot_date' })
  if (error) throw error

  revalidatePath('/analytics')
}
```

### Add "Generate Snapshot" button to `app/(dashboard)/analytics/page.tsx`:

Extract a Client Component `GenerateSnapshotButton`:

```tsx
'use client'

import { useTransition, useState } from 'react'
import { generateDailySnapshot } from '@/features/analytics/server/generate-snapshot'

export function GenerateSnapshotButton() {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') return null

  function handleGenerate() {
    startTransition(async () => {
      await generateDailySnapshot()
      setDone(true)
      setTimeout(() => setDone(false), 3000)
    })
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={isPending}
      className="text-xs px-3 py-1.5 rounded border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-50"
    >
      {isPending ? 'Generating...' : done ? 'Snapshot saved' : 'Generate Snapshot'}
    </button>
  )
}
```

Add to the analytics page header area next to `<PageHeader>`.

- [ ] **Step 1: Create `features/analytics/server/generate-snapshot.ts`** with `generateDailySnapshot`
- [ ] **Step 2: Create `features/analytics/components/generate-snapshot-button.tsx`** (Client Component)
- [ ] **Step 3: Add button to `app/(dashboard)/analytics/page.tsx`** next to PageHeader
- [ ] **Step 4: Run tests + tsc**
- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add analytics snapshot generation — compute real daily metrics from DB"
```

---

## Task T7: Opportunity Score Rationale Detail Panel

**Files:**
- Modify: `features/opportunities/components/opportunity-card.tsx`

The `score_rationale` object (strategic_fit, audience_overlap, growth_potential, ease_of_execution) is stored but never shown. Users approve based on score alone — they have no visibility into WHY a score was assigned.

### Add expandable rationale section to `opportunity-card.tsx`:

Add expand toggle state and a collapsed rationale section:

```tsx
const [showRationale, setShowRationale] = useState(false)

// Add below score badge, before action buttons:
{opportunity.score_rationale && (
  <div className="mt-3">
    <button
      onClick={() => setShowRationale(r => !r)}
      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1"
    >
      {showRationale ? '▲ Hide rationale' : '▼ Show rationale'}
    </button>
    {showRationale && (
      <div className="mt-2 space-y-2 text-xs bg-[var(--surface-raised)] rounded p-3">
        {Object.entries(opportunity.score_rationale).map(([key, value]) => (
          <div key={key}>
            <span className="text-[var(--text-muted)] capitalize">{key.replace(/_/g, ' ')}</span>
            <p className="text-[var(--text-primary)] mt-0.5">{value as string}</p>
          </div>
        ))}
        {opportunity.estimated_impact && (
          <div className="pt-2 border-t border-[var(--border-color)]">
            <span className="text-[var(--text-muted)]">Estimated impact</span>
            <p className="text-[var(--text-primary)] mt-0.5">{opportunity.estimated_impact}</p>
          </div>
        )}
      </div>
    )}
  </div>
)}
```

- [ ] **Step 1: Add `showRationale` state to `opportunity-card.tsx`**
- [ ] **Step 2: Add expandable rationale section**
- [ ] **Step 3: Run tests + tsc**
- [ ] **Step 4: Commit**

```bash
git commit -m "feat: expandable score rationale panel on opportunity cards"
```

---

## Task T8: Final Verification

- [ ] **Step 1: Run full test suite** — `npm test` — target ≥ 37 passing
- [ ] **Step 2: Run TypeScript check** — `npx tsc --noEmit`
- [ ] **Step 3: Run production build** — `npm run build`
- [ ] **Step 4: Verify git log** — confirm all 7 commits present
