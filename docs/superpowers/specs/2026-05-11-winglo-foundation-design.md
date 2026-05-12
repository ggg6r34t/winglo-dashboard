# Winglo Growth Agent — Foundation Phase Design

**Date:** 2026-05-11
**Phase:** Foundation (Phase 1 of N)
**Status:** Approved

---

## Overview

This document specifies the Foundation phase of the Winglo Growth Agent — an internal AI operations dashboard that functions as an AI-powered Head of Growth & Partnerships.

The Foundation phase establishes everything subsequent phases build on: project scaffold, design system, layout shell, database schema, AI provider abstraction, and mock data architecture. No business logic is implemented in this phase.

### What is NOT in scope for this phase

- Authentication (deferred — mock session used)
- Agent execution logic (scaffolded, not implemented)
- Any page beyond shell + skeleton content
- Real data persistence (Supabase client wired, but mock data flag is on by default)

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Auth | Deferred (mock session) | Faster to first visual; auth added later |
| Database | Supabase + migrations in scope | Core schema must be correct from the start |
| Multi-tenancy | Yes, organizations are first-class | Will be used across multiple businesses |
| AI provider | OpenAI (real) + Anthropic (stub) | OpenAI is primary; abstraction layer enables swap |
| Layout shell | Top bar + collapsible sidebar | Multi-tenancy + AI status need persistent top surface |
| Mock data | `NEXT_PUBLIC_USE_MOCK_DATA=true` flag | DAL-level switching, UI never knows the difference |

---

## 1. Project Architecture

### Dependencies

| Package | Purpose |
|---|---|
| `shadcn/ui` | Component primitives (Radix-based) |
| `framer-motion` | Sidebar collapse, layout animations |
| `@supabase/supabase-js` | Database client |
| `@supabase/ssr` | Server-side Supabase helpers for Next.js |
| `openai` | OpenAI SDK |
| `zustand` | Client state (sidebar, UI preferences) |
| `@tanstack/react-query` | Server state, caching, background refetch |
| `zod` | Schema validation everywhere |
| `react-hook-form` | Forms |
| `@hookform/resolvers` | Zod + react-hook-form bridge |

### Route structure

```
app/
  layout.tsx                    ← root layout (fonts, providers)
  (dashboard)/
    layout.tsx                  ← shell layout (top bar + sidebar)
    dashboard/page.tsx          ← command center
    intake/page.tsx             ← business intake
    opportunities/page.tsx      ← partnership discovery
    outreach/page.tsx           ← drafts & approval queue
    memory/page.tsx             ← institutional memory
    analytics/page.tsx          ← growth analytics
    settings/page.tsx           ← org & user settings
  (auth)/
    login/page.tsx              ← stubbed, auth deferred
```

### Feature folder structure

```
features/
  dashboard/     components/ hooks/ types/
  intake/        components/ hooks/ server/ types/ validations/
  opportunities/ components/ hooks/ server/ types/
  outreach/      components/ hooks/ server/ types/
  memory/        components/ hooks/ server/ types/
  analytics/     components/ hooks/ charts/ types/
  agents/
    intake-agent/ research-agent/ discovery-agent/
    scoring-agent/ outreach-agent/ memory-agent/ analytics-agent/

components/
  ui/            ← shadcn output
  layout/        ← top bar, sidebar, shell
  shared/        ← cards, badges, empty states, skeletons

lib/
  ai/
    providers/
      types.ts           ← AIProvider interface
      openai.ts          ← real OpenAI implementation
      anthropic.ts       ← stubbed Anthropic implementation
      index.ts           ← exports active provider via AI_PROVIDER env
    orchestration/       ← multi-agent workflow runner (scaffolded)
    prompts/             ← system prompts per agent (scaffolded)
    structured-output/   ← Zod schemas for AI responses
    mocks/               ← mock AI responses (used when USE_MOCK_DATA=true)

  supabase/
    client.ts            ← browser client
    server.ts            ← server client (SSR)

  validations/           ← shared Zod schemas
  constants/
  utils/
  env/                   ← typed env vars

server/
  actions/               ← Server Actions
  dal/                   ← data access layer
  services/              ← business logic

supabase/
  migrations/            ← SQL migration files
  seed/                  ← dev seed data

types/                   ← global shared types
lib/mock/
  fixtures/              ← all mock data
  index.ts
```

---

## 2. Design System

### Color palette (dark mode default)

```css
/* Background */
--background:        #0a0a0a
--surface:           #111111
--surface-raised:    #161616
--border:            #1f1f1f
--border-strong:     #2a2a2a

/* Text */
--text-primary:      #f4f4f5
--text-secondary:    #a1a1aa
--text-muted:        #52525b

/* Accent */
--accent:            #6366f1
--accent-subtle:     #1e1b4b

/* Semantic */
--success:           #22c55e
--warning:           #f59e0b
--destructive:       #ef4444
--info:              #3b82f6
```

Light mode supported via CSS variable swap. Dark is the default.

### Score colors (opportunity scoring)

| Range | Color |
|---|---|
| 90–100 | `#22c55e` |
| 70–89 | `#84cc16` |
| 50–69 | `#f59e0b` |
| < 50 | `#ef4444` |

### Typography

- **Font:** Geist Sans (already installed)
- **Mono:** Geist Mono (code, IDs, agent logs)

| Token | Size | Use |
|---|---|---|
| `text-xs` | 11px | Metadata, timestamps, badges |
| `text-sm` | 13px | Body, table cells, secondary labels |
| `text-base` | 15px | Primary body |
| `text-lg` | 17px | Section headers, card titles |
| `text-xl` | 20px | Page titles |
| `text-2xl` | 24px | Major section headers |
| `text-3xl` | 30px | Key metrics / numbers |

### Spacing & layout

```
Base unit:            4px
Sidebar width:        220px expanded / 52px collapsed
Top bar height:       52px
Content max-width:    1280px
Content padding:      24px
Card padding:         16px
Section gap:          24px
```

### Component tokens

```
Border radius: sm=4px, md=6px, lg=8px, xl=12px
Transitions:   fast=150ms, base=200ms, slow=300ms (sidebar, panels)
Shadow card:   0 1px 3px rgba(0,0,0,0.4)
Shadow raised: 0 4px 12px rgba(0,0,0,0.5)
```

---

## 3. Layout Shell

### Top bar (52px, fixed)

| Zone | Content |
|---|---|
| Left | Org switcher (name + logo initial + dropdown) |
| Center | Global search trigger (`⌘K`, opens command palette modal) |
| Right | AI activity indicator, notification bell, user avatar/menu |

**AI activity indicator:** animated pulse dot + "N agents running" label. Driven by `ai_runs` table (mock in Foundation).

### Sidebar

**Nav items:**
```
Dashboard      /dashboard      (grid icon)
Intake         /intake         (upload icon)
Opportunities  /opportunities  (target icon)
Outreach       /outreach       (send icon)
Memory         /memory         (database icon)
Analytics      /analytics      (chart icon)
```

**Bottom:**
```
Settings       /settings       (settings icon)
Collapse       —               (chevron icon)
```

**Behavior:**
- Collapse state in Zustand, persisted to localStorage
- Framer Motion `layout` animation on width change (150ms)
- Collapsed: icons only, Radix Tooltip on hover
- Active: accent left-border indicator + subtle background tint

### Content area

- Fills remaining width after sidebar
- Top offset: 52px (top bar) + 24px padding
- Horizontal padding: 24px
- Max content width: 1280px, centered

### Component tree

```
(dashboard)/layout.tsx
  └── ShellLayout
       ├── TopBar
       │    ├── OrgSwitcher
       │    ├── CommandPalette (trigger + modal)
       │    ├── AgentStatusIndicator
       │    ├── NotificationBell
       │    └── UserMenu
       ├── Sidebar
       │    ├── NavItems
       │    └── CollapseToggle
       └── ContentArea
```

### Page shells

Each route in Foundation gets:
- Correct page header (title + subtitle)
- Skeleton placeholders shaped to the real content
- A designed empty state with icon + title + CTA

---

## 4. Database Schema

### Multi-tenancy model

Every table is scoped by `organization_id`. RLS policies enforce org isolation at the database level using `current_setting('app.current_org_id')`. The server Supabase client sets this on every connection. In mock mode, it's set to the seed org's ID.

### Tables

#### `organizations`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| slug | text UNIQUE | |
| logo_url | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `business_profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| organization_id | uuid FK | |
| name | text | |
| website_url | text | |
| description | text | |
| icp | jsonb | AI-extracted ideal customer profile |
| positioning | jsonb | AI-extracted positioning |
| growth_brief | jsonb | AI-generated growth brief |
| brand_voice | text | |
| target_audience | text | |
| goals | text[] | |
| status | text | `draft` \| `processing` \| `complete` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `opportunities`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| organization_id | uuid FK | |
| business_profile_id | uuid FK | |
| company_name | text | |
| company_url | text | |
| company_description | text | |
| opportunity_type | text | `integration` \| `co-marketing` \| `reseller` \| `distribution` \| `technology` |
| score | integer | 0–100 |
| score_rationale | jsonb | |
| estimated_impact | text | |
| status | text | `new` \| `reviewing` \| `approved` \| `rejected` \| `contacted` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `outreach_drafts`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| organization_id | uuid FK | |
| opportunity_id | uuid FK | |
| channel | text | `email` \| `linkedin` \| `proposal` |
| subject | text | |
| body | text | |
| tone | text | `professional` \| `warm` \| `direct` |
| status | text | `draft` \| `approved` \| `sent` \| `rejected` |
| sent_at | timestamptz | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `memory_entries`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| organization_id | uuid FK | |
| entry_type | text | `partner_interaction` \| `learning` \| `observation` |
| title | text | |
| body | text | |
| source | text | Which agent or user created this |
| related_company | text | |
| embedding | vector(1536) | pgvector for semantic search |
| metadata | jsonb | |
| created_at | timestamptz | |

#### `ai_runs`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| organization_id | uuid FK | |
| agent_type | text | `intake` \| `discovery` \| `scoring` \| `outreach` \| `memory` \| `analytics` |
| status | text | `queued` \| `running` \| `complete` \| `failed` |
| input | jsonb | |
| output | jsonb | |
| error | text | |
| duration_ms | integer | |
| tokens_used | integer | |
| started_at | timestamptz | |
| completed_at | timestamptz | |
| created_at | timestamptz | |

#### `agent_logs`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| ai_run_id | uuid FK → ai_runs | |
| organization_id | uuid FK | |
| level | text | `info` \| `warning` \| `error` |
| message | text | |
| metadata | jsonb | |
| created_at | timestamptz | |

#### `analytics_snapshots`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| organization_id | uuid FK | |
| snapshot_date | date | |
| metrics | jsonb | Flexible bag: outreach_sent, response_rate, etc. |
| created_at | timestamptz | |

### Indexes

```sql
-- FK columns on all tables (standard)
-- opportunities(status), opportunities(score DESC)
-- outreach_drafts(status), outreach_drafts(opportunity_id)
-- memory_entries(entry_type), memory_entries(related_company)
-- memory_entries USING ivfflat (embedding vector_cosine_ops)
-- ai_runs(status), ai_runs(agent_type)
-- ai_runs(organization_id, created_at DESC)
-- agent_logs(ai_run_id, created_at)
```

### RLS pattern

```sql
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON <table>
  USING (organization_id = current_setting('app.current_org_id')::uuid);
```

Applied to all tables.

---

## 5. AI Provider Abstraction

### Provider interface (`lib/ai/providers/types.ts`)

```typescript
interface CompletionOptions {
  messages: Message[]
  model?: string
  temperature?: number
  maxTokens?: number
  schema?: ZodSchema        // triggers structured output mode
  systemPrompt?: string
}

interface CompletionResult<T = string> {
  content: T
  tokensUsed: number
  model: string
  durationMs: number
}

interface AIProvider {
  complete<T = string>(options: CompletionOptions): Promise<CompletionResult<T>>
  stream(options: CompletionOptions): AsyncIterable<string>
}
```

### OpenAI implementation (`lib/ai/providers/openai.ts`)

- Default model: `gpt-4o`
- Structured output: JSON mode + Zod `.parse()` when `schema` is provided
- Retries: 3 attempts with exponential backoff on 429/500
- Logs token usage to `ai_runs` via DAL

### Anthropic stub (`lib/ai/providers/anthropic.ts`)

- Implements `AIProvider` interface
- Throws `NotImplementedError` — intentional, not silent
- Ready to wire up `@anthropic-ai/sdk` when needed

### Active provider (`lib/ai/providers/index.ts`)

```typescript
const provider = process.env.AI_PROVIDER === 'anthropic'
  ? new AnthropicProvider()
  : new OpenAIProvider()

export { provider as ai }
```

### Prompt scaffold (`lib/ai/prompts/`)

Each agent file exports:
- `systemPrompt: string`
- `formatInput(data): Message[]`
- `outputSchema: ZodSchema`

Foundation: all 7 agent prompt files are created with placeholder system prompts and correct TypeScript structure. Not executed yet.

### Mock AI mode

When `NEXT_PUBLIC_USE_MOCK_DATA=true`, a `MockProvider` returns fixture data from `lib/ai/mocks/`. Mock responses are typed against the same Zod schemas as real responses.

---

## 6. Mock Data Architecture

### Flag

```
NEXT_PUBLIC_USE_MOCK_DATA=true
```

Read at the DAL layer. UI never knows the difference.

### DAL pattern

```typescript
// server/dal/opportunities.ts
export async function getOpportunities(orgId: string) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockOpportunities.filter(o => o.organization_id === orgId)
  }
  const { data } = await supabase
    .from('opportunities')
    .select('*')
    .eq('organization_id', orgId)
  return data
}
```

### Fixture files

```
lib/mock/fixtures/
  organizations.ts      ← 2 orgs
  business-profiles.ts  ← 2 profiles, fully populated
  opportunities.ts      ← 12 opportunities (varied scores, types, statuses)
  outreach-drafts.ts    ← 8 drafts (email, LinkedIn, proposal)
  memory-entries.ts     ← 15 entries (interactions, learnings, observations)
  ai-runs.ts            ← 6 runs in various states
  agent-logs.ts         ← logs for those runs
  analytics.ts          ← 90 days of daily snapshots
```

### Realistic fixture content

Primary mock org: **"Acme AI"** — B2B SaaS tool for sales teams

Example opportunities:
- Salesforce AppExchange partnership (score: 91, type: integration)
- Outreach.io co-marketing (score: 78, type: co-marketing)
- G2 partner program (score: 65, type: distribution)
- HubSpot marketplace (score: 88, type: integration)

Example memory entries:
- "Spoke with Salesforce BD team on 2026-03-12. Interested in native CRM integration. Follow up Q2."
- "G2 review campaigns drive 3x higher qualified leads than cold outreach."

Example AI runs:
- Intake agent: `complete`, 4.2s, 1,840 tokens
- Discovery agent: `running`, 8 opportunities found
- Scoring agent: `failed`, rate limit error

### Page states

Every page implements all three states:
- **Loading** — skeletons shaped to match real content
- **Empty** — icon + title + CTA ("Run your first intake", etc.)
- **Error** — contained error card with retry action

---

## Environment variables

```
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=

# Optional
AI_PROVIDER=openai          # or 'anthropic'
NEXT_PUBLIC_USE_MOCK_DATA=true
```

---

## Out of scope for this phase

- Authentication flows
- Agent execution (prompts are scaffolded, not run)
- Real-time subscriptions (Supabase Realtime)
- Email/LinkedIn sending integrations
- pgvector semantic search queries (column exists, queries deferred)
- CI/CD configuration
