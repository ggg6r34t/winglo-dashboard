# Winglo Growth Agent — How the AI Agents Work

This document explains exactly how agents are defined, how they communicate with an LLM, how they chain together, and what happens at runtime. Written so you can understand the full picture from zero.

---

## The Big Picture

Winglo is an AI-powered Head of Growth. When you submit your business profile, a chain of specialized agents runs in sequence:

```
User submits form
       │
       ▼
  [Intake Agent]          ← What is this business? Who is their ICP?
       │
       ▼
  [Discovery Agent]       ← Who should they partner with?
       │
       ▼
  [Research Agent]        ← (runs once per opportunity) What do we know about this company?
       │
       ▼
  [Scoring Agent]         ← (runs once per opportunity) How good a fit is this partner? 0–100
       │
       ▼
  Opportunities saved to DB, page refreshed
```

Other agents run independently:

- **Outreach Agent** — triggered when you click "Generate Draft" on an opportunity
- **Memory Agent** — triggered when you submit a note in the Memory page
- **Analytics Agent** — triggered when you click "Regenerate Insights" in Analytics

---

## How an Agent Is Defined

Every agent lives in `lib/ai/prompts/` and exports exactly three things:

```
lib/ai/prompts/
  intake-agent.ts
  discovery-agent.ts
  research-agent.ts
  scoring-agent.ts
  outreach-agent.ts
  memory-agent.ts
  analytics-agent.ts
```

Each file has the same shape:

```typescript
// 1. The system prompt — tells the LLM its role and rules
export const systemPrompt = `You are the Intake Agent for Winglo...`

// 2. The output schema — a Zod schema that defines what the LLM must return
export const outputSchema = z.object({
  icp: z.object({ ... }),
  positioning: z.object({ ... }),
  growth_brief: z.object({ ... }),
})
export type IntakeOutput = z.infer<typeof outputSchema>

// 3. formatInput — builds the user message(s) from runtime data
export function formatInput(data: { name: string; description?: string }): Message[] {
  return [{ role: 'user', content: `Analyze this business...${data.name}` }]
}
```

That's the entire definition of an agent. No class, no registration, no framework. Just a system prompt, a schema, and an input formatter.

---

## How an Agent Is Called

All agent calls go through a single abstraction:

```typescript
// lib/ai/providers/index.ts
export const ai: AIProvider = createProvider()
```

`ai.complete()` is the only call site you'll ever see in the codebase:

```typescript
const result = await ai.complete({
  messages: formatInput(data),       // the user message(s)
  systemPrompt: systemPrompt,        // the agent's role
  schema: outputSchema,              // what shape the JSON response must be
})

// result.content is already typed and validated — TypeScript knows its shape
console.log(result.content.icp.industry)  // string ✓
```

Under the hood, `ai.complete()`:
1. Prepends the `systemPrompt` as a system message
2. Calls the LLM with `response_format: { type: 'json_object' }` (forces JSON output)
3. Parses the raw JSON response through the Zod schema
4. Throws if the response doesn't match the schema
5. Returns the validated, typed content

---

## The Provider Abstraction

```
lib/ai/providers/
  types.ts        ← AIProvider interface
  openai.ts       ← Real OpenAI implementation (gpt-4o, 3 retries, exponential backoff)
  anthropic.ts    ← Real Anthropic implementation
  mock.ts         ← Fake implementation for local dev (instant, no API calls)
  index.ts        ← Picks which provider to use based on env vars
```

The `AIProvider` interface:

```typescript
interface AIProvider {
  complete<T>(options: CompletionOptions<T>): Promise<CompletionResult<T>>
  stream(options: CompletionOptions): AsyncIterable<string>
}
```

Which provider gets used is decided once at startup in `index.ts`:

```typescript
function createProvider(): AIProvider {
  if (env.useMockData)           return new MockProvider()
  if (env.aiProvider === 'anthropic') return new AnthropicProvider()
  return new OpenAIProvider()
}

export const ai: AIProvider = createProvider()
```

Agent code never imports OpenAI directly. It always calls `ai.complete()`. Switching from OpenAI to Anthropic is a one-line env var change.

---

## Mock Mode

When `NEXT_PUBLIC_USE_MOCK_DATA=true`, `MockProvider` is used instead of real APIs.

`MockProvider` detects which agent is calling it by reading keywords in the system prompt:

```typescript
// lib/ai/providers/mock.ts
function detectAgentType(options: CompletionOptions): string {
  const text = options.systemPrompt?.toLowerCase() ?? ''
  if (text.includes('intake agent'))    return 'intake'
  if (text.includes('discovery agent')) return 'discovery'
  if (text.includes('scoring agent'))   return 'scoring'
  // ...
}
```

Then it returns a pre-built hardcoded response from `lib/ai/mocks/index.ts` — a JSON string that is schema-valid for that agent. This means:

- No network calls
- Instant responses
- Deterministic output
- The UI is fully functional with realistic-looking data

---

## The Orchestration Chain (runDiscovery)

The most complex flow is `runDiscovery` in `features/intake/server/actions.ts`. Here's how the chain works:

```
runDiscovery(profileId)
│
├── Fetch business profile from DB
├── Fetch existing memory entries (for context)
│
├── CREATE AI Run: discovery
│   └── ai.complete(discoveryAgent, profile + memory context)
│       → Returns: [{ company_name, opportunity_type, rationale }, ...]
│   └── COMPLETE AI Run: discovery
│
├── CREATE AI Run: research
│   └── Promise.all: for each discovered opportunity:
│       └── ai.complete(researchAgent, { companyName, companyUrl })
│           → Returns: { description, business_model, partner_program_exists, ... }
│   └── COMPLETE AI Run: research
│
├── CREATE AI Run: scoring
│   └── Promise.all: for each researched opportunity:
│       └── ai.complete(scoringAgent, profile + researched company)
│           → Returns: { score: 85, score_rationale: { ... } }
│   └── COMPLETE AI Run: scoring
│
└── createOpportunities(all scored results)  ← save to DB
    └── revalidatePath('/opportunities')      ← refresh the page
```

The research and scoring agents run in parallel across all opportunities (`Promise.all`). If a company has 5 discovery results, that's 5 simultaneous research calls and 5 simultaneous scoring calls.

---

## AI Run Tracking

Every agent invocation creates a row in the `ai_runs` table. This is how the dashboard and activity feed know what's happening.

The lifecycle:

```typescript
// 1. Create the run record (status: 'queued')
const run = await createAIRun(orgId, 'discovery', { profileId })

// 2. Mark it running
await updateAIRun(run.id, { status: 'running', started_at: new Date().toISOString() })

// 3. Do the actual AI work
const result = await ai.complete({ ... })

// 4a. On success: mark complete with output + token count
await updateAIRun(run.id, {
  status: 'complete',
  output: result.content,
  tokens_used: result.tokensUsed,
  duration_ms: Date.now() - start,
  completed_at: new Date().toISOString(),
})

// 4b. On failure: mark failed with error message
await updateAIRun(run.id, {
  status: 'failed',
  error: error.message,
  duration_ms: Date.now() - start,
  completed_at: new Date().toISOString(),
})
```

The `AIRun` type:

```typescript
interface AIRun {
  id: string
  organization_id: string
  agent_type: 'intake' | 'discovery' | 'research' | 'scoring' | 'outreach' | 'memory' | 'analytics'
  status: 'queued' | 'running' | 'complete' | 'failed'
  input: Record<string, unknown>
  output: Record<string, unknown> | null
  error: string | null
  tokens_used: number | null
  duration_ms: number | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}
```

---

## Rate Limiting

Every agent that costs money has an in-memory rate limiter applied in its Server Action, **after** the mock mode short-circuit:

```typescript
export async function generateOutreachDraft(...) {
  // 1. Mock mode — return immediately, no rate limit needed
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockOutreachDrafts[0]
  }

  // 2. Rate limit check — throws RateLimitError if exceeded
  const clientKey = await getClientKey()   // IP from x-forwarded-for header
  outreachRateLimiter.check(clientKey)     // 5 calls/min per IP

  // 3. Actual AI work...
}
```

Limits per action (`lib/rate-limiters.ts`):

| Action | Limit |
|---|---|
| `analyzeBusinessProfile` (intake) | 3/min |
| `runDiscovery` | 2/min |
| `generateOutreachDraft` | 5/min |
| `createMemoryFromNotes` | 10/min |
| `generateAnalyticsInsights` | 3/min |

> **Note:** The limiter uses an in-memory `Map`, so it resets on server restart and doesn't work across multiple server instances. For production at scale, replace `lib/rate-limit.ts` with a Redis-backed implementation.

---

## The 7 Agents at a Glance

| Agent | File | Triggered by | Input | Output |
|---|---|---|---|---|
| **Intake** | `intake-agent.ts` | Submitting the business profile form | Business name, URL, description | ICP, Positioning, Growth Brief |
| **Discovery** | `discovery-agent.ts` | "Discover Opportunities" button | Business profile + memory context | 5–10 potential partner companies |
| **Research** | `research-agent.ts` | Auto, after Discovery | Company name + URL | Business model, customers, partner program details |
| **Scoring** | `scoring-agent.ts` | Auto, after Research | Business profile + researched partner | Score 0–100, 4-dimension rationale |
| **Outreach** | `outreach-agent.ts` | "Generate Draft" on an opportunity | Profile, opportunity, channel, tone | Subject line + message body |
| **Memory** | `memory-agent.ts` | Submitting a note in Memory page | Raw notes text + optional context | Structured memory entry (title, body, type, company) |
| **Analytics** | `analytics-agent.ts` | "Regenerate Insights" button | Last 30 days of snapshot metrics | Summary, insights list, recommendations, highlight metric |

---

## Adding a New Agent

1. Create `lib/ai/prompts/my-agent.ts` with `systemPrompt`, `outputSchema`, and `formatInput`
2. Add a mock response in `lib/ai/mocks/index.ts` under a new key
3. Add the detection keyword in `lib/ai/providers/mock.ts` → `detectAgentType()`
4. Add a rate limiter in `lib/rate-limiters.ts`
5. Create a Server Action in `features/<domain>/server/actions.ts` that calls `ai.complete()`, tracks an `AIRun`, and revalidates the relevant path

No other registration or wiring is needed.

---

## File Map

```
lib/
  ai/
    providers/
      types.ts          ← AIProvider interface
      index.ts          ← Provider factory (picks mock/openai/anthropic)
      openai.ts         ← OpenAI gpt-4o, retries, JSON mode
      anthropic.ts      ← Anthropic claude-* implementation
      mock.ts           ← Instant fake responses for local dev
    prompts/
      intake-agent.ts   ← systemPrompt + schema + formatInput
      discovery-agent.ts
      research-agent.ts
      scoring-agent.ts
      outreach-agent.ts
      memory-agent.ts
      analytics-agent.ts
    mocks/
      index.ts          ← Hardcoded schema-valid JSON per agent type
  rate-limit.ts         ← Sliding-window in-memory rate limiter
  rate-limiters.ts      ← Pre-configured limiter instances
  get-client-key.ts     ← Extracts IP for rate limiting

features/
  intake/server/actions.ts    ← analyzeBusinessProfile, runDiscovery (main chain)
  outreach/server/actions.ts  ← generateOutreachDraft
  memory/server/actions.ts    ← createMemoryFromNotes
  analytics/server/actions.ts ← generateAnalyticsInsights

server/dal/
  ai-runs.ts           ← createAIRun, updateAIRun, getAIRuns
```
