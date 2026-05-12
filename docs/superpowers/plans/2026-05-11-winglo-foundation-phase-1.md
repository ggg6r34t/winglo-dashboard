# Winglo Foundation — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the project infrastructure — dependencies, TypeScript types, design system tokens, Supabase schema, mock data fixtures, and data access layer.

**Architecture:** Multi-tenant Next.js 16 App Router app using Tailwind v4 CSS variables for the design system. All data access goes through a DAL that switches between mock fixtures and Supabase based on `NEXT_PUBLIC_USE_MOCK_DATA`. Mock fixtures are typed against Zod schemas identical to what real AI responses use.

**Tech Stack:** Next.js 16.2.6, React 19, TypeScript, Tailwind v4, Supabase (postgres + pgvector), Zod, Vitest

**Spec:** `docs/superpowers/specs/2026-05-11-winglo-foundation-design.md`

---

## File Map

```
Created:
  .env.local.example
  vitest.config.ts
  vitest.setup.ts
  types/database.ts
  types/index.ts
  app/globals.css                          ← replace
  lib/env/index.ts
  lib/supabase/client.ts
  lib/supabase/server.ts
  lib/utils.ts
  lib/mock/fixtures/organizations.ts
  lib/mock/fixtures/business-profiles.ts
  lib/mock/fixtures/opportunities.ts
  lib/mock/fixtures/outreach-drafts.ts
  lib/mock/fixtures/memory-entries.ts
  lib/mock/fixtures/ai-runs.ts
  lib/mock/fixtures/agent-logs.ts
  lib/mock/fixtures/analytics.ts
  lib/mock/index.ts
  server/dal/organizations.ts
  server/dal/business-profiles.ts
  server/dal/opportunities.ts
  server/dal/outreach-drafts.ts
  server/dal/memory-entries.ts
  server/dal/ai-runs.ts
  server/dal/analytics-snapshots.ts
  supabase/migrations/0001_initial_schema.sql

Modified:
  package.json                             ← add scripts + devDependencies
```

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install all runtime dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr openai zustand @tanstack/react-query zod react-hook-form @hookform/resolvers framer-motion clsx tailwind-merge
```

Expected output: `added N packages`

- [ ] **Step 2: Install dev dependencies**

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom server-only
```

Expected output: `added N packages`

- [ ] **Step 3: Verify no peer dependency errors**

```bash
npm ls --depth=0 2>&1 | grep -i "WARN\|ERROR" || echo "clean"
```

Expected: `clean` or only minor warnings, no missing peer dep errors.

- [ ] **Step 4: Create .env.local.example**

Create `.env.local.example`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI
OPENAI_API_KEY=sk-...
AI_PROVIDER=openai

# Dev
NEXT_PUBLIC_USE_MOCK_DATA=true
```

- [ ] **Step 5: Create .env.local from example (for dev)**

```bash
cp .env.local.example .env.local
```

Then open `.env.local` and fill in real Supabase + OpenAI values (or leave as-is for mock mode).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .env.local.example
git commit -m "feat: install project dependencies"
```

---

## Task 2: Vitest Setup

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`

- [ ] **Step 1: Write a failing smoke test**

Create `vitest.setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

Create a temp smoke test `__tests__/smoke.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'

describe('smoke', () => {
  it('true is true', () => {
    expect(true).toBe(true)
  })
})
```

- [ ] **Step 2: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 3: Add test script to package.json**

Open `package.json` and add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test
```

Expected: `1 passed`

- [ ] **Step 5: Delete temp smoke test, commit**

```bash
rm __tests__/smoke.test.ts
git add vitest.config.ts vitest.setup.ts package.json
git commit -m "feat: configure vitest test runner"
```

---

## Task 3: TypeScript Entity Types

**Files:**
- Create: `types/database.ts`
- Create: `types/index.ts`

- [ ] **Step 1: Write the failing type test**

Create `__tests__/types.test.ts`:

```typescript
import { describe, it, expectTypeOf } from 'vitest'
import type { Organization, BusinessProfile, Opportunity, OutreachDraft, MemoryEntry, AIRun, AgentLog, AnalyticsSnapshot } from '@/types'

describe('entity types', () => {
  it('Organization has required fields', () => {
    expectTypeOf<Organization>().toHaveProperty('id')
    expectTypeOf<Organization>().toHaveProperty('name')
    expectTypeOf<Organization>().toHaveProperty('slug')
  })
  it('Opportunity has score field', () => {
    expectTypeOf<Opportunity>().toHaveProperty('score')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test -- __tests__/types.test.ts
```

Expected: FAIL — `@/types` not found.

- [ ] **Step 3: Create types/database.ts**

```typescript
export type OrganizationStatus = 'active' | 'inactive'

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  created_at: string
  updated_at: string
}

export type BusinessProfileStatus = 'draft' | 'processing' | 'complete'

export interface ICP {
  company_size?: string
  industry?: string
  role?: string
  pain_points?: string[]
  budget_range?: string
}

export interface Positioning {
  value_proposition?: string
  differentiators?: string[]
  competitors?: string[]
  category?: string
}

export interface GrowthBrief {
  summary?: string
  opportunities?: string[]
  recommended_channels?: string[]
  partnership_categories?: string[]
}

export interface BusinessProfile {
  id: string
  organization_id: string
  name: string
  website_url: string | null
  description: string | null
  icp: ICP | null
  positioning: Positioning | null
  growth_brief: GrowthBrief | null
  brand_voice: string | null
  target_audience: string | null
  goals: string[]
  status: BusinessProfileStatus
  created_at: string
  updated_at: string
}

export type OpportunityType =
  | 'integration'
  | 'co-marketing'
  | 'reseller'
  | 'distribution'
  | 'technology'
  | 'strategic'

export type OpportunityStatus =
  | 'new'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'contacted'

export interface ScoreRationale {
  strategic_fit: string
  audience_overlap: string
  growth_potential: string
  ease_of_execution: string
}

export interface Opportunity {
  id: string
  organization_id: string
  business_profile_id: string
  company_name: string
  company_url: string | null
  company_description: string | null
  opportunity_type: OpportunityType
  score: number
  score_rationale: ScoreRationale | null
  estimated_impact: string | null
  status: OpportunityStatus
  created_at: string
  updated_at: string
}

export type OutreachChannel = 'email' | 'linkedin' | 'proposal'
export type OutreachTone = 'professional' | 'warm' | 'direct'
export type OutreachStatus = 'draft' | 'approved' | 'sent' | 'rejected'

export interface OutreachDraft {
  id: string
  organization_id: string
  opportunity_id: string
  channel: OutreachChannel
  subject: string | null
  body: string
  tone: OutreachTone
  status: OutreachStatus
  sent_at: string | null
  created_at: string
  updated_at: string
}

export type MemoryEntryType = 'partner_interaction' | 'learning' | 'observation'

export interface MemoryEntry {
  id: string
  organization_id: string
  entry_type: MemoryEntryType
  title: string
  body: string
  source: string
  related_company: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export type AgentType =
  | 'intake'
  | 'research'
  | 'discovery'
  | 'scoring'
  | 'outreach'
  | 'memory'
  | 'analytics'

export type AIRunStatus = 'queued' | 'running' | 'complete' | 'failed'

export interface AIRun {
  id: string
  organization_id: string
  agent_type: AgentType
  status: AIRunStatus
  input: Record<string, unknown> | null
  output: Record<string, unknown> | null
  error: string | null
  duration_ms: number | null
  tokens_used: number | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export type LogLevel = 'info' | 'warning' | 'error'

export interface AgentLog {
  id: string
  ai_run_id: string
  organization_id: string
  level: LogLevel
  message: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface AnalyticsMetrics {
  outreach_sent: number
  outreach_approved: number
  opportunities_discovered: number
  opportunities_approved: number
  response_rate: number
  avg_score: number
}

export interface AnalyticsSnapshot {
  id: string
  organization_id: string
  snapshot_date: string
  metrics: AnalyticsMetrics
  created_at: string
}
```

- [ ] **Step 4: Create types/index.ts**

```typescript
export * from './database'
```

- [ ] **Step 5: Run type test to verify it passes**

```bash
npm test -- __tests__/types.test.ts
```

Expected: `2 passed`

- [ ] **Step 6: Commit**

```bash
git add types/ __tests__/types.test.ts
git commit -m "feat: add TypeScript entity types for all database tables"
```

---

## Task 4: Design System (globals.css)

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Replace globals.css with full design token set**

```css
@import "tailwindcss";

/* Dark mode via .dark class on <html> */
@custom-variant dark (&:where(.dark, .dark *));

/* ── Design tokens ────────────────────────────────────── */
@theme inline {
  /* Fonts */
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);

  /* Background layers */
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-surface-raised: var(--surface-raised);

  /* Borders */
  --color-border: var(--border-color);
  --color-border-strong: var(--border-strong);

  /* Text */
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);

  /* Accent */
  --color-accent: var(--accent);
  --color-accent-subtle: var(--accent-subtle);

  /* Semantic */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-destructive: #ef4444;
  --color-info: #3b82f6;
}

/* ── Dark mode (default) ──────────────────────────────── */
:root {
  --background: #0a0a0a;
  --surface: #111111;
  --surface-raised: #161616;
  --border-color: #1f1f1f;
  --border-strong: #2a2a2a;
  --text-primary: #f4f4f5;
  --text-secondary: #a1a1aa;
  --text-muted: #52525b;
  --accent: #6366f1;
  --accent-subtle: #1e1b4b;
}

/* ── Light mode ───────────────────────────────────────── */
.light {
  --background: #ffffff;
  --surface: #f9f9f9;
  --surface-raised: #f0f0f0;
  --border-color: #e4e4e7;
  --border-strong: #d4d4d8;
  --text-primary: #09090b;
  --text-secondary: #71717a;
  --text-muted: #a1a1aa;
  --accent: #6366f1;
  --accent-subtle: #eef2ff;
}

/* ── Base styles ──────────────────────────────────────── */
html {
  color-scheme: dark;
}

html.light {
  color-scheme: light;
}

body {
  background-color: var(--background);
  color: var(--text-primary);
  font-family: var(--font-sans, system-ui, sans-serif);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ── Scrollbar styling ────────────────────────────────── */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
```

- [ ] **Step 2: Verify dev server starts without CSS errors**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected: page loads, dark background visible (`#0a0a0a`). No console CSS errors.

Stop the dev server (`Ctrl+C`).

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: implement design system tokens in globals.css"
```

---

## Task 5: Environment Types and Supabase Clients

**Files:**
- Create: `lib/env/index.ts`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/utils.ts`

- [ ] **Step 1: Create lib/env/index.ts**

```typescript
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  openaiApiKey: process.env.OPENAI_API_KEY!,
  aiProvider: (process.env.AI_PROVIDER ?? 'openai') as 'openai' | 'anthropic',
  useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true',
} as const
```

- [ ] **Step 2: Create lib/supabase/client.ts**

```typescript
import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'

export function createClient() {
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey)
}
```

- [ ] **Step 3: Create lib/supabase/server.ts**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Component — cannot set cookies; fine for read-only
        }
      },
    },
  })
}

export async function createServiceClient() {
  const cookieStore = await cookies()

  return createServerClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {}
      },
    },
  })
}
```

- [ ] **Step 4: Create lib/utils.ts**

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return formatDate(date)
}

export function scoreToColor(score: number): string {
  if (score >= 90) return '#22c55e'
  if (score >= 70) return '#84cc16'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

export function scoreToLabel(score: number): string {
  if (score >= 90) return 'Strong'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Moderate'
  return 'Weak'
}
```

- [ ] **Step 5: Update tsconfig.json to add path alias if missing**

Open `tsconfig.json`. Ensure `compilerOptions` contains:

```json
"paths": {
  "@/*": ["./*"]
}
```

If it already exists, skip.

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add lib/ tsconfig.json
git commit -m "feat: add env config, supabase clients, and cn utility"
```

---

## Task 6: Supabase Migration

**Files:**
- Create: `supabase/migrations/0001_initial_schema.sql`

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/0001_initial_schema.sql`:

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- ── organizations ────────────────────────────────────────
CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  logo_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── business_profiles ────────────────────────────────────
CREATE TABLE business_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  website_url      TEXT,
  description      TEXT,
  icp              JSONB,
  positioning      JSONB,
  growth_brief     JSONB,
  brand_voice      TEXT,
  target_audience  TEXT,
  goals            TEXT[] NOT NULL DEFAULT '{}',
  status           TEXT NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft', 'processing', 'complete')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── opportunities ─────────────────────────────────────────
CREATE TABLE opportunities (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  business_profile_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  company_name        TEXT NOT NULL,
  company_url         TEXT,
  company_description TEXT,
  opportunity_type    TEXT NOT NULL
                      CHECK (opportunity_type IN (
                        'integration', 'co-marketing', 'reseller',
                        'distribution', 'technology', 'strategic'
                      )),
  score               INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  score_rationale     JSONB,
  estimated_impact    TEXT,
  status              TEXT NOT NULL DEFAULT 'new'
                      CHECK (status IN (
                        'new', 'reviewing', 'approved', 'rejected', 'contacted'
                      )),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── outreach_drafts ──────────────────────────────────────
CREATE TABLE outreach_drafts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  channel         TEXT NOT NULL CHECK (channel IN ('email', 'linkedin', 'proposal')),
  subject         TEXT,
  body            TEXT NOT NULL,
  tone            TEXT NOT NULL DEFAULT 'professional'
                  CHECK (tone IN ('professional', 'warm', 'direct')),
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'approved', 'sent', 'rejected')),
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── memory_entries ───────────────────────────────────────
CREATE TABLE memory_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entry_type      TEXT NOT NULL
                  CHECK (entry_type IN (
                    'partner_interaction', 'learning', 'observation'
                  )),
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  source          TEXT NOT NULL,
  related_company TEXT,
  embedding       VECTOR(1536),
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ai_runs ──────────────────────────────────────────────
CREATE TABLE ai_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_type      TEXT NOT NULL
                  CHECK (agent_type IN (
                    'intake', 'research', 'discovery', 'scoring',
                    'outreach', 'memory', 'analytics'
                  )),
  status          TEXT NOT NULL DEFAULT 'queued'
                  CHECK (status IN ('queued', 'running', 'complete', 'failed')),
  input           JSONB,
  output          JSONB,
  error           TEXT,
  duration_ms     INTEGER,
  tokens_used     INTEGER,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── agent_logs ───────────────────────────────────────────
CREATE TABLE agent_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_run_id       UUID NOT NULL REFERENCES ai_runs(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  level           TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error')),
  message         TEXT NOT NULL,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── analytics_snapshots ──────────────────────────────────
CREATE TABLE analytics_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  snapshot_date   DATE NOT NULL,
  metrics         JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, snapshot_date)
);

-- ── Indexes ───────────────────────────────────────────────
CREATE INDEX idx_business_profiles_org ON business_profiles(organization_id);
CREATE INDEX idx_opportunities_org ON opportunities(organization_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_score ON opportunities(score DESC);
CREATE INDEX idx_opportunities_profile ON opportunities(business_profile_id);
CREATE INDEX idx_outreach_drafts_org ON outreach_drafts(organization_id);
CREATE INDEX idx_outreach_drafts_status ON outreach_drafts(status);
CREATE INDEX idx_outreach_drafts_opportunity ON outreach_drafts(opportunity_id);
CREATE INDEX idx_memory_entries_org ON memory_entries(organization_id);
CREATE INDEX idx_memory_entries_type ON memory_entries(entry_type);
CREATE INDEX idx_memory_entries_company ON memory_entries(related_company);
CREATE INDEX idx_ai_runs_org_created ON ai_runs(organization_id, created_at DESC);
CREATE INDEX idx_ai_runs_status ON ai_runs(status);
CREATE INDEX idx_ai_runs_agent_type ON ai_runs(agent_type);
CREATE INDEX idx_agent_logs_run ON agent_logs(ai_run_id, created_at);
CREATE INDEX idx_analytics_org_date ON analytics_snapshots(organization_id, snapshot_date DESC);

-- pgvector index (IVFFlat for cosine similarity)
CREATE INDEX idx_memory_embedding ON memory_entries
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ── Row Level Security ────────────────────────────────────
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS policy pattern: every table reads app.current_org_id
CREATE POLICY "org_isolation" ON organizations
  USING (id = current_setting('app.current_org_id', TRUE)::UUID);

CREATE POLICY "org_isolation" ON business_profiles
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);

CREATE POLICY "org_isolation" ON opportunities
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);

CREATE POLICY "org_isolation" ON outreach_drafts
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);

CREATE POLICY "org_isolation" ON memory_entries
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);

CREATE POLICY "org_isolation" ON ai_runs
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);

CREATE POLICY "org_isolation" ON agent_logs
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);

CREATE POLICY "org_isolation" ON analytics_snapshots
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);

-- ── Seed org for mock/dev mode ─────────────────────────────
-- Used when NEXT_PUBLIC_USE_MOCK_DATA=true
-- ID is hardcoded so mock fixtures can reference it
INSERT INTO organizations (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Acme AI', 'acme-ai');

INSERT INTO organizations (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000002', 'Demo Corp', 'demo-corp');
```

- [ ] **Step 2: Verify SQL is syntactically valid (if Supabase CLI is available)**

If you have Supabase CLI installed:
```bash
supabase db diff --local 2>/dev/null || echo "Supabase CLI not available — SQL review only"
```

If not available, review the SQL manually for syntax errors (all constraints and types are standard PostgreSQL).

- [ ] **Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add initial database schema with RLS policies"
```

---

## Task 7: Mock Data Fixtures

**Files:**
- Create: `lib/mock/fixtures/organizations.ts`
- Create: `lib/mock/fixtures/business-profiles.ts`
- Create: `lib/mock/fixtures/opportunities.ts`
- Create: `lib/mock/fixtures/outreach-drafts.ts`
- Create: `lib/mock/fixtures/memory-entries.ts`
- Create: `lib/mock/fixtures/ai-runs.ts`
- Create: `lib/mock/fixtures/agent-logs.ts`
- Create: `lib/mock/fixtures/analytics.ts`
- Create: `lib/mock/index.ts`

- [ ] **Step 1: Create lib/mock/fixtures/organizations.ts**

```typescript
import type { Organization } from '@/types'

export const mockOrganizations: Organization[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Acme AI',
    slug: 'acme-ai',
    logo_url: null,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-05-01T14:30:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Demo Corp',
    slug: 'demo-corp',
    logo_url: null,
    created_at: '2026-02-10T09:00:00Z',
    updated_at: '2026-04-20T11:00:00Z',
  },
]

export const MOCK_ORG_ID = '00000000-0000-0000-0000-000000000001'
```

- [ ] **Step 2: Create lib/mock/fixtures/business-profiles.ts**

```typescript
import type { BusinessProfile } from '@/types'
import { MOCK_ORG_ID } from './organizations'

export const mockBusinessProfiles: BusinessProfile[] = [
  {
    id: 'bp-0000-0000-0000-000000000001',
    organization_id: MOCK_ORG_ID,
    name: 'Acme AI — Sales Intelligence Platform',
    website_url: 'https://acme-ai.example.com',
    description:
      'Acme AI is a B2B SaaS platform that uses AI to surface revenue signals and prioritize accounts for sales teams at mid-market and enterprise companies.',
    icp: {
      company_size: '200–2000 employees',
      industry: 'B2B SaaS, Financial Services, Professional Services',
      role: 'VP Sales, Revenue Operations, SDR Managers',
      pain_points: [
        'Reps spend too much time on non-ICP accounts',
        'CRM data is stale and incomplete',
        'No signal for when to reach out',
      ],
      budget_range: '$30k–$150k/year',
    },
    positioning: {
      value_proposition:
        'Replace gut-feel prioritization with AI-driven revenue signals so reps focus only on accounts ready to buy.',
      differentiators: [
        'Real-time buying intent from 50+ data sources',
        'Native CRM sync with zero manual entry',
        'Explainable AI — reps see why each account is flagged',
      ],
      competitors: ['6sense', 'Bombora', 'G2 Buyer Intent'],
      category: 'Revenue Intelligence / Buyer Intent',
    },
    growth_brief: {
      summary:
        'Acme AI is well-positioned in the revenue intelligence space with a strong PLG motion for SMB and an enterprise sales motion above $50k ACV. Primary growth lever is integration partnerships with major CRMs and SEPs.',
      opportunities: [
        'Salesforce AppExchange listing — 150k+ admin installs per month',
        'Outreach.io native integration — shared ICP with high overlap',
        'G2 review generation campaign — 3x qualified lead lift',
        'HubSpot marketplace — 20k+ active users in ICP',
      ],
      recommended_channels: [
        'Integration marketplace listings',
        'Co-marketing with CRM partners',
        'G2 / Capterra review campaigns',
        'LinkedIn thought leadership (VP Sales audience)',
      ],
      partnership_categories: [
        'CRM integrations',
        'Sales engagement platforms',
        'Revenue operations tools',
        'Intent data providers',
      ],
    },
    brand_voice:
      'Direct, data-driven, and credible. We speak in outcomes and numbers. No fluff.',
    target_audience:
      'VP of Sales and RevOps leaders at B2B SaaS companies with 50–500 person sales teams.',
    goals: [
      'Grow to $10M ARR by end of 2026',
      'Sign 3 integration partnerships with top CRMs',
      'Increase inbound from G2/Capterra by 40%',
    ],
    status: 'complete',
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-05-10T16:00:00Z',
  },
  {
    id: 'bp-0000-0000-0000-000000000002',
    organization_id: '00000000-0000-0000-0000-000000000002',
    name: 'Demo Corp — HR Automation',
    website_url: 'https://democorp.example.com',
    description: 'HR workflow automation for mid-market companies.',
    icp: null,
    positioning: null,
    growth_brief: null,
    brand_voice: null,
    target_audience: null,
    goals: [],
    status: 'draft',
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-04-01T10:00:00Z',
  },
]

export const MOCK_PROFILE_ID = 'bp-0000-0000-0000-000000000001'
```

- [ ] **Step 3: Create lib/mock/fixtures/opportunities.ts**

```typescript
import type { Opportunity } from '@/types'
import { MOCK_ORG_ID } from './organizations'
import { MOCK_PROFILE_ID } from './business-profiles'

const ORG = MOCK_ORG_ID
const PROFILE = MOCK_PROFILE_ID

export const mockOpportunities: Opportunity[] = [
  {
    id: 'opp-00000000-0000-0000-000000000001',
    organization_id: ORG,
    business_profile_id: PROFILE,
    company_name: 'Salesforce',
    company_url: 'https://salesforce.com',
    company_description:
      'The world\'s #1 CRM platform with 150,000+ customers and the largest enterprise software AppExchange.',
    opportunity_type: 'integration',
    score: 91,
    score_rationale: {
      strategic_fit: 'Salesforce is the dominant CRM used by 70%+ of our ICP. A native integration removes the #1 objection in demos.',
      audience_overlap: 'Direct overlap — Salesforce admins and RevOps leaders are exactly our buyer persona.',
      growth_potential: 'AppExchange listings average 12k installs/month for tools in our category. Estimated 300+ qualified leads/month.',
      ease_of_execution: 'Salesforce has a well-documented ISV program. Integration is technically feasible in 6–8 weeks.',
    },
    estimated_impact: '300+ qualified leads/month, $800k pipeline in first year',
    status: 'approved',
    created_at: '2026-04-15T10:00:00Z',
    updated_at: '2026-05-08T14:00:00Z',
  },
  {
    id: 'opp-00000000-0000-0000-000000000002',
    organization_id: ORG,
    business_profile_id: PROFILE,
    company_name: 'HubSpot',
    company_url: 'https://hubspot.com',
    company_description:
      'CRM, marketing, and sales platform with 200,000+ customers predominantly in the SMB and mid-market segment.',
    opportunity_type: 'integration',
    score: 88,
    score_rationale: {
      strategic_fit: 'HubSpot users are expanding upmarket — our PLG motion maps well to their self-serve install flow.',
      audience_overlap: 'HubSpot marketplace users skew to our secondary ICP (200–500 employee companies).',
      growth_potential: 'HubSpot App Marketplace has 20k+ daily active users browsing integrations.',
      ease_of_execution: 'HubSpot has a public App Marketplace program with clear certification steps.',
    },
    estimated_impact: '150–200 qualified leads/month, strong PLG conversion',
    status: 'reviewing',
    created_at: '2026-04-16T10:00:00Z',
    updated_at: '2026-05-09T11:00:00Z',
  },
  {
    id: 'opp-00000000-0000-0000-000000000003',
    organization_id: ORG,
    business_profile_id: PROFILE,
    company_name: 'Outreach',
    company_url: 'https://outreach.io',
    company_description:
      'Leading sales engagement platform used by 6,000+ enterprise sales teams for email sequencing and call cadences.',
    opportunity_type: 'integration',
    score: 85,
    score_rationale: {
      strategic_fit: 'Outreach users are our primary ICP — enterprise sales teams who already invest in sales tech.',
      audience_overlap: 'Direct buyer overlap. Shared customers would benefit from Acme AI signals triggering Outreach sequences.',
      growth_potential: 'Joint GTM with Outreach could unlock co-marketing to their 100k+ rep user base.',
      ease_of_execution: 'Outreach has an open API and an established partner program.',
    },
    estimated_impact: 'Co-marketing campaign projected at 500 MQLs, $1.2M pipeline',
    status: 'new',
    created_at: '2026-04-20T10:00:00Z',
    updated_at: '2026-04-20T10:00:00Z',
  },
  {
    id: 'opp-00000000-0000-0000-000000000004',
    organization_id: ORG,
    business_profile_id: PROFILE,
    company_name: 'G2',
    company_url: 'https://g2.com',
    company_description:
      'The world\'s largest B2B software review platform with 80M annual visitors and buyer intent data products.',
    opportunity_type: 'distribution',
    score: 78,
    score_rationale: {
      strategic_fit: 'G2 Buyer Intent data is a complement to our product — and G2 review campaigns drive 3x qualified leads vs. cold outreach.',
      audience_overlap: 'G2 categories (Sales Intelligence, Revenue Intelligence) are exactly where our buyers research.',
      growth_potential: 'Enhanced G2 profile + review generation campaign estimated to drive 80+ inbound MQLs/month.',
      ease_of_execution: 'G2 has a straightforward paid partner program. Campaign can launch in 2 weeks.',
    },
    estimated_impact: '80+ inbound MQLs/month, improved category ranking',
    status: 'approved',
    created_at: '2026-04-22T10:00:00Z',
    updated_at: '2026-05-05T09:00:00Z',
  },
  {
    id: 'opp-00000000-0000-0000-000000000005',
    organization_id: ORG,
    business_profile_id: PROFILE,
    company_name: 'Gong',
    company_url: 'https://gong.io',
    company_description:
      'Revenue intelligence platform that records, transcribes, and analyzes sales calls. Used by 4,000+ customers.',
    opportunity_type: 'technology',
    score: 72,
    score_rationale: {
      strategic_fit: 'Gong captures conversation signals; Acme AI captures intent signals. Together they create a complete revenue picture.',
      audience_overlap: 'Gong and Acme AI share the same VP Sales buyer at enterprise companies.',
      growth_potential: 'Joint solution story could open enterprise accounts that neither company can crack alone.',
      ease_of_execution: 'Gong has an open API but no formal partner program — BD conversation required first.',
    },
    estimated_impact: 'Enterprise deals unlocked — potential for 5–8 co-sell wins in first year',
    status: 'new',
    created_at: '2026-04-25T10:00:00Z',
    updated_at: '2026-04-25T10:00:00Z',
  },
  {
    id: 'opp-00000000-0000-0000-000000000006',
    organization_id: ORG,
    business_profile_id: PROFILE,
    company_name: 'Apollo.io',
    company_url: 'https://apollo.io',
    company_description:
      'Sales intelligence and engagement platform with 275M+ contacts and 60M+ companies.',
    opportunity_type: 'co-marketing',
    score: 68,
    score_rationale: {
      strategic_fit: 'Apollo is a partial competitor but also a complementary data source. Co-marketing to SMB could work without channel conflict.',
      audience_overlap: 'Apollo users skew SMB — lower overlap with our primary enterprise ICP but strong with secondary.',
      growth_potential: 'Apollo has a large email list (500k+). Co-marketing webinar could generate 300+ registrations.',
      ease_of_execution: 'Apollo has an active partner ecosystem and responds to co-marketing proposals.',
    },
    estimated_impact: '200–300 registrations from co-marketing webinar, 40+ SQLs',
    status: 'reviewing',
    created_at: '2026-05-01T10:00:00Z',
    updated_at: '2026-05-07T15:00:00Z',
  },
  {
    id: 'opp-00000000-0000-0000-000000000007',
    organization_id: ORG,
    business_profile_id: PROFILE,
    company_name: 'Clari',
    company_url: 'https://clari.com',
    company_description: 'Revenue operations platform focused on forecasting and pipeline management.',
    opportunity_type: 'technology',
    score: 64,
    score_rationale: {
      strategic_fit: 'Clari and Acme AI both serve RevOps. Integration would add intent signals to Clari forecasts.',
      audience_overlap: 'Same RevOps buyer, but Clari is more enterprise-focused and we\'d be a smaller partner.',
      growth_potential: 'Moderate — Clari has 1,500+ customers but limited integration partner marketing.',
      ease_of_execution: 'Clari has a partner program but it\'s invite-only and moves slowly.',
    },
    estimated_impact: 'Indirect — improves product stickiness more than drives new leads',
    status: 'new',
    created_at: '2026-05-03T10:00:00Z',
    updated_at: '2026-05-03T10:00:00Z',
  },
  {
    id: 'opp-00000000-0000-0000-000000000008',
    organization_id: ORG,
    business_profile_id: PROFILE,
    company_name: 'Drift',
    company_url: 'https://drift.com',
    company_description: 'Conversational marketing and sales platform (acquired by Salesloft).',
    opportunity_type: 'co-marketing',
    score: 58,
    score_rationale: {
      strategic_fit: 'Drift/Salesloft integration could create a signal-to-conversation workflow but strategic fit is moderate.',
      audience_overlap: 'Partial overlap — Drift skews to marketing-led teams, our ICP is sales-led.',
      growth_potential: 'Limited post-acquisition uncertainty makes this a lower priority.',
      ease_of_execution: 'Post-acquisition partner program is in flux — unclear timeline.',
    },
    estimated_impact: 'Uncertain — monitor post-acquisition strategy before investing',
    status: 'rejected',
    created_at: '2026-05-05T10:00:00Z',
    updated_at: '2026-05-09T10:00:00Z',
  },
]
```

- [ ] **Step 4: Create lib/mock/fixtures/outreach-drafts.ts**

```typescript
import type { OutreachDraft } from '@/types'
import { MOCK_ORG_ID } from './organizations'

const ORG = MOCK_ORG_ID

export const mockOutreachDrafts: OutreachDraft[] = [
  {
    id: 'od-000000000000000000000000001',
    organization_id: ORG,
    opportunity_id: 'opp-00000000-0000-0000-000000000001',
    channel: 'email',
    subject: 'Partnership Opportunity: Acme AI × Salesforce AppExchange',
    body: `Hi [Name],

I lead partnerships at Acme AI — we're a revenue intelligence platform used by 200+ B2B sales teams to prioritize their highest-intent accounts.

I've been following Salesforce's AppExchange momentum and believe there's a compelling integration story here. Our customers consistently rank "native CRM sync" as their #1 requested feature, and Salesforce admins in our ICP use AppExchange as their primary tool discovery channel.

Specifically, I'd love to explore:
- A certified AppExchange listing with native CRM field mapping
- Co-marketing to your RevOps admin community
- A joint case study with a shared customer (we have 3 in common)

Would you have 20 minutes in the next two weeks to explore fit? I can share our current integration spec and customer data to make the conversation concrete.

Best,
[Your name]
Acme AI`,
    tone: 'professional',
    status: 'approved',
    sent_at: null,
    created_at: '2026-05-08T10:00:00Z',
    updated_at: '2026-05-08T14:00:00Z',
  },
  {
    id: 'od-000000000000000000000000002',
    organization_id: ORG,
    opportunity_id: 'opp-00000000-0000-0000-000000000001',
    channel: 'linkedin',
    subject: null,
    body: `Hi [Name],

Noticed you lead ISV partnerships at Salesforce — I head up partnerships at Acme AI, a revenue intelligence tool our customers say "belongs in every Salesforce org."

We have 3 customers in common who've been asking for a native AppExchange integration. Would love to share what we're seeing and explore whether there's mutual interest.

Open to a quick call?`,
    tone: 'warm',
    status: 'draft',
    sent_at: null,
    created_at: '2026-05-08T11:00:00Z',
    updated_at: '2026-05-08T11:00:00Z',
  },
  {
    id: 'od-000000000000000000000000003',
    organization_id: ORG,
    opportunity_id: 'opp-00000000-0000-0000-000000000002',
    channel: 'email',
    subject: 'HubSpot App Marketplace — Partnership Proposal',
    body: `Hi [Name],

I'm reaching out from Acme AI regarding a potential listing on the HubSpot App Marketplace.

We're a revenue intelligence platform that helps sales teams prioritize accounts based on AI-driven buying signals. We currently have 40+ customers who use HubSpot as their CRM and have been requesting a native integration.

Our value proposition for HubSpot users:
- Real-time intent signals surfaced directly in HubSpot contact records
- Automatic sequence enrollment based on intent triggers
- No manual data entry — signals sync automatically

I'd love to understand the certification requirements and explore co-marketing opportunities. Would you be open to a 30-minute call?

Thanks,
[Your name]`,
    tone: 'professional',
    status: 'draft',
    sent_at: null,
    created_at: '2026-05-09T09:00:00Z',
    updated_at: '2026-05-09T09:00:00Z',
  },
  {
    id: 'od-000000000000000000000000004',
    organization_id: ORG,
    opportunity_id: 'opp-00000000-0000-0000-000000000003',
    channel: 'email',
    subject: 'Co-marketing Idea: Acme AI × Outreach — Intent-Triggered Sequences',
    body: `Hi [Name],

Quick intro: I lead partnerships at Acme AI. We're a buyer intent platform that helps enterprise sales teams know when to reach out — and Outreach users are exactly who we built it for.

I have a specific co-marketing idea I think could drive meaningful pipeline for both of us:

**"Intent-to-Outreach" Campaign**
- Joint webinar: "How top sales teams combine intent signals with automated sequencing"
- Target audience: VP Sales and SDR managers (shared ICP)
- Projected reach: 500 registrations between our combined lists
- Content asset: Data report on response rates when intent signals trigger sequences

We've seen this story resonate with 3 of your customers we share — happy to make the intro.

Would you be up for a 20-min call to see if the timing works?

[Your name]`,
    tone: 'direct',
    status: 'draft',
    sent_at: null,
    created_at: '2026-05-09T11:00:00Z',
    updated_at: '2026-05-09T11:00:00Z',
  },
  {
    id: 'od-000000000000000000000000005',
    organization_id: ORG,
    opportunity_id: 'opp-00000000-0000-0000-000000000004',
    channel: 'email',
    subject: 'G2 Review Campaign + Buyer Intent Partnership — Acme AI',
    body: `Hi [Name],

I lead partnerships at Acme AI. We're listed on G2 in the Sales Intelligence category and have been consistently rated 4.7/5 by our customers.

I'm reaching out because I'd like to explore two things:

1. **Enhanced profile + review generation**: We want to run a structured review campaign to get from 28 reviews to 100+ over the next 90 days. Looking for the right G2 partner to help design this.

2. **Buyer Intent data**: Several of our prospects are researching competitors on G2 right now. We'd like to explore whether G2 Buyer Intent data could be a complementary input to our own signals.

Is there someone on your team who handles both the partner program and buyer intent product for companies at our stage?

Thanks,
[Your name]`,
    tone: 'professional',
    status: 'approved',
    sent_at: '2026-05-07T14:00:00Z',
    created_at: '2026-05-06T10:00:00Z',
    updated_at: '2026-05-07T14:00:00Z',
  },
]
```

- [ ] **Step 5: Create lib/mock/fixtures/memory-entries.ts**

```typescript
import type { MemoryEntry } from '@/types'
import { MOCK_ORG_ID } from './organizations'

const ORG = MOCK_ORG_ID

export const mockMemoryEntries: MemoryEntry[] = [
  {
    id: 'mem-0000000000000000000000001',
    organization_id: ORG,
    entry_type: 'partner_interaction',
    title: 'Salesforce BD call — AppExchange interest confirmed',
    body: 'Spoke with Marcus Chen (ISV Partnerships, Salesforce) on 2026-03-12. He confirmed Salesforce is actively recruiting revenue intelligence tools to AppExchange. They want 3 reference customers before starting certification. Timeline: 8–10 weeks for full certification. Marcus will send over ISV program docs. Follow up by April 1.',
    source: 'memory-agent',
    related_company: 'Salesforce',
    metadata: { contact: 'Marcus Chen', date: '2026-03-12', follow_up_date: '2026-04-01' },
    created_at: '2026-03-12T17:00:00Z',
  },
  {
    id: 'mem-0000000000000000000000002',
    organization_id: ORG,
    entry_type: 'learning',
    title: 'G2 review campaigns drive 3x higher qualified leads vs. cold outreach',
    body: 'Analysis of our last 90 days of lead sources: leads from G2 (organic profile views + review responses) convert to SQL at 18% vs. 6% for cold outbound. Cost per SQL from G2 is $340 vs. $890 from outbound. Recommendation: prioritize G2 optimization and review generation before scaling outbound.',
    source: 'analytics-agent',
    related_company: 'G2',
    metadata: { data_period: '2026-02-01_to_2026-05-01', source_data: 'CRM analysis' },
    created_at: '2026-05-02T10:00:00Z',
  },
  {
    id: 'mem-0000000000000000000000003',
    organization_id: ORG,
    entry_type: 'observation',
    title: 'Outreach.io recently launched an open partner program',
    body: 'Outreach announced a new partner ecosystem program on 2026-04-28 with a public API portal and a dedicated partner BD team. This significantly reduces the barrier to a technical integration. Their announcement mentions "sales intelligence" as a priority integration category — strong signal for us.',
    source: 'research-agent',
    related_company: 'Outreach',
    metadata: { source_url: 'https://outreach.io/blog/partner-ecosystem-2026', date: '2026-04-28' },
    created_at: '2026-04-29T09:00:00Z',
  },
  {
    id: 'mem-0000000000000000000000004',
    organization_id: ORG,
    entry_type: 'partner_interaction',
    title: 'HubSpot App Marketplace — initial outreach sent',
    body: 'Sent initial partnership email to Sarah Park (HubSpot App Marketplace team) on 2026-05-09. No response yet. Follow up in 5 business days (2026-05-16). Note: HubSpot certification requires 50+ installs before enhanced placement.',
    source: 'outreach-agent',
    related_company: 'HubSpot',
    metadata: { contact: 'Sarah Park', outreach_id: 'od-000000000000000000000000003' },
    created_at: '2026-05-09T09:30:00Z',
  },
  {
    id: 'mem-0000000000000000000000005',
    organization_id: ORG,
    entry_type: 'learning',
    title: 'Enterprise sales teams prefer "show don\'t tell" in partnership pitches',
    body: 'Pattern observed across 5 BD conversations in Q1 2026: partners respond better when we lead with a specific shared customer story rather than feature lists. The most effective opener: "We have [N] customers in common and they\'ve been asking for this integration." Converts cold outreach to meeting at 2.3x rate vs. generic value prop pitch.',
    source: 'memory-agent',
    related_company: null,
    metadata: { sample_size: 5, time_period: 'Q1 2026' },
    created_at: '2026-04-10T14:00:00Z',
  },
  {
    id: 'mem-0000000000000000000000006',
    organization_id: ORG,
    entry_type: 'observation',
    title: 'Gong raised $250M Series E — actively expanding partner ecosystem',
    body: 'Gong announced a $250M Series E on 2026-03-20 with stated plans to build an "open revenue data platform." Their investor deck mentions 40+ planned integration partners in 2026. This is the right time to approach them — pre-ecosystem-lock-in.',
    source: 'research-agent',
    related_company: 'Gong',
    metadata: { funding_amount: '$250M', round: 'Series E', date: '2026-03-20' },
    created_at: '2026-03-21T10:00:00Z',
  },
]
```

- [ ] **Step 6: Create lib/mock/fixtures/ai-runs.ts**

```typescript
import type { AIRun } from '@/types'
import { MOCK_ORG_ID } from './organizations'

const ORG = MOCK_ORG_ID

export const mockAIRuns: AIRun[] = [
  {
    id: 'run-00000000000000000000000001',
    organization_id: ORG,
    agent_type: 'intake',
    status: 'complete',
    input: { website_url: 'https://acme-ai.example.com', run_type: 'full_analysis' },
    output: { profile_id: 'bp-0000-0000-0000-000000000001', sections_completed: 5 },
    error: null,
    duration_ms: 4210,
    tokens_used: 1840,
    started_at: '2026-05-10T09:00:00Z',
    completed_at: '2026-05-10T09:00:04Z',
    created_at: '2026-05-10T09:00:00Z',
  },
  {
    id: 'run-00000000000000000000000002',
    organization_id: ORG,
    agent_type: 'discovery',
    status: 'complete',
    input: { profile_id: 'bp-0000-0000-0000-000000000001' },
    output: { opportunities_found: 8, opportunities_created: 8 },
    error: null,
    duration_ms: 12400,
    tokens_used: 4200,
    started_at: '2026-05-10T09:01:00Z',
    completed_at: '2026-05-10T09:01:12Z',
    created_at: '2026-05-10T09:01:00Z',
  },
  {
    id: 'run-00000000000000000000000003',
    organization_id: ORG,
    agent_type: 'scoring',
    status: 'complete',
    input: { opportunity_ids: ['opp-00000000-0000-0000-000000000001', 'opp-00000000-0000-0000-000000000002'] },
    output: { scored: 2, avg_score: 89.5 },
    error: null,
    duration_ms: 6800,
    tokens_used: 2100,
    started_at: '2026-05-10T09:02:00Z',
    completed_at: '2026-05-10T09:02:07Z',
    created_at: '2026-05-10T09:02:00Z',
  },
  {
    id: 'run-00000000000000000000000004',
    organization_id: ORG,
    agent_type: 'outreach',
    status: 'running',
    input: { opportunity_id: 'opp-00000000-0000-0000-000000000003', channels: ['email', 'linkedin'] },
    output: null,
    error: null,
    duration_ms: null,
    tokens_used: null,
    started_at: '2026-05-11T08:55:00Z',
    completed_at: null,
    created_at: '2026-05-11T08:55:00Z',
  },
  {
    id: 'run-00000000000000000000000005',
    organization_id: ORG,
    agent_type: 'memory',
    status: 'failed',
    input: { source: 'partner_interaction', raw_notes: '...' },
    output: null,
    error: 'Rate limit exceeded — retrying in 60s',
    duration_ms: 1200,
    tokens_used: null,
    started_at: '2026-05-11T08:40:00Z',
    completed_at: '2026-05-11T08:40:01Z',
    created_at: '2026-05-11T08:40:00Z',
  },
  {
    id: 'run-00000000000000000000000006',
    organization_id: ORG,
    agent_type: 'analytics',
    status: 'queued',
    input: { snapshot_date: '2026-05-11', org_id: ORG },
    output: null,
    error: null,
    duration_ms: null,
    tokens_used: null,
    started_at: null,
    completed_at: null,
    created_at: '2026-05-11T09:00:00Z',
  },
]
```

- [ ] **Step 7: Create lib/mock/fixtures/agent-logs.ts**

```typescript
import type { AgentLog } from '@/types'
import { MOCK_ORG_ID } from './organizations'

const ORG = MOCK_ORG_ID

export const mockAgentLogs: AgentLog[] = [
  {
    id: 'log-0000000000000000000000001',
    ai_run_id: 'run-00000000000000000000000001',
    organization_id: ORG,
    level: 'info',
    message: 'Starting intake analysis for https://acme-ai.example.com',
    metadata: { step: 'init' },
    created_at: '2026-05-10T09:00:00Z',
  },
  {
    id: 'log-0000000000000000000000002',
    ai_run_id: 'run-00000000000000000000000001',
    organization_id: ORG,
    level: 'info',
    message: 'Extracted ICP: B2B SaaS, VP Sales, 200–2000 employees',
    metadata: { step: 'icp_extraction', confidence: 0.92 },
    created_at: '2026-05-10T09:00:01Z',
  },
  {
    id: 'log-0000000000000000000000003',
    ai_run_id: 'run-00000000000000000000000001',
    organization_id: ORG,
    level: 'info',
    message: 'Growth brief generated with 4 recommended partnership categories',
    metadata: { step: 'growth_brief', categories: 4 },
    created_at: '2026-05-10T09:00:04Z',
  },
  {
    id: 'log-0000000000000000000000004',
    ai_run_id: 'run-00000000000000000000000005',
    organization_id: ORG,
    level: 'error',
    message: 'OpenAI API rate limit hit — 429 Too Many Requests',
    metadata: { step: 'embedding_generation', retry_after: 60 },
    created_at: '2026-05-11T08:40:01Z',
  },
  {
    id: 'log-0000000000000000000000005',
    ai_run_id: 'run-00000000000000000000000004',
    organization_id: ORG,
    level: 'info',
    message: 'Generating email outreach for Outreach.io (tone: direct)',
    metadata: { step: 'draft_generation', channel: 'email', opportunity: 'opp-00000000-0000-0000-000000000003' },
    created_at: '2026-05-11T08:55:01Z',
  },
]
```

- [ ] **Step 8: Create lib/mock/fixtures/analytics.ts**

```typescript
import type { AnalyticsSnapshot } from '@/types'
import { MOCK_ORG_ID } from './organizations'

const ORG = MOCK_ORG_ID

function generateSnapshots(): AnalyticsSnapshot[] {
  const snapshots: AnalyticsSnapshot[] = []
  const start = new Date('2026-02-10')

  for (let i = 0; i < 90; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    const baseOutreachSent = Math.floor(2 + Math.random() * 4)
    const baseOutreachApproved = Math.floor(baseOutreachSent * 0.6)
    const baseOppsDiscovered = i % 7 === 0 ? Math.floor(1 + Math.random() * 3) : 0
    const baseOppsApproved = i % 14 === 0 ? Math.floor(1 + Math.random() * 2) : 0

    snapshots.push({
      id: `snap-${dateStr}`,
      organization_id: ORG,
      snapshot_date: dateStr,
      metrics: {
        outreach_sent: baseOutreachSent,
        outreach_approved: baseOutreachApproved,
        opportunities_discovered: baseOppsDiscovered,
        opportunities_approved: baseOppsApproved,
        response_rate: parseFloat((0.08 + Math.random() * 0.12).toFixed(3)),
        avg_score: parseFloat((65 + Math.random() * 20).toFixed(1)),
      },
      created_at: `${dateStr}T23:59:00Z`,
    })
  }

  return snapshots
}

export const mockAnalyticsSnapshots: AnalyticsSnapshot[] = generateSnapshots()
```

- [ ] **Step 9: Create lib/mock/index.ts**

```typescript
export { mockOrganizations, MOCK_ORG_ID } from './fixtures/organizations'
export { mockBusinessProfiles, MOCK_PROFILE_ID } from './fixtures/business-profiles'
export { mockOpportunities } from './fixtures/opportunities'
export { mockOutreachDrafts } from './fixtures/outreach-drafts'
export { mockMemoryEntries } from './fixtures/memory-entries'
export { mockAIRuns } from './fixtures/ai-runs'
export { mockAgentLogs } from './fixtures/agent-logs'
export { mockAnalyticsSnapshots } from './fixtures/analytics'
```

- [ ] **Step 10: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 11: Commit**

```bash
git add lib/mock/
git commit -m "feat: add realistic mock data fixtures for all entities"
```

---

## Task 8: Data Access Layer (DAL)

**Files:**
- Create: `server/dal/organizations.ts`
- Create: `server/dal/business-profiles.ts`
- Create: `server/dal/opportunities.ts`
- Create: `server/dal/outreach-drafts.ts`
- Create: `server/dal/memory-entries.ts`
- Create: `server/dal/ai-runs.ts`
- Create: `server/dal/analytics-snapshots.ts`
- Create: `__tests__/dal.test.ts`

- [ ] **Step 1: Write failing DAL tests**

Create `__tests__/dal.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from 'vitest'
import { vi } from 'vitest'

// Force mock mode
vi.stubEnv('NEXT_PUBLIC_USE_MOCK_DATA', 'true')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'placeholder-key')

import { MOCK_ORG_ID } from '@/lib/mock'

describe('DAL - mock mode', () => {
  it('getOrganizations returns all orgs', async () => {
    const { getOrganizations } = await import('@/server/dal/organizations')
    const orgs = await getOrganizations()
    expect(orgs.length).toBeGreaterThanOrEqual(2)
    expect(orgs[0]).toHaveProperty('id')
    expect(orgs[0]).toHaveProperty('slug')
  })

  it('getOrganizationById returns correct org', async () => {
    const { getOrganizationById } = await import('@/server/dal/organizations')
    const org = await getOrganizationById(MOCK_ORG_ID)
    expect(org?.slug).toBe('acme-ai')
  })

  it('getOpportunities filters by orgId', async () => {
    const { getOpportunities } = await import('@/server/dal/opportunities')
    const opps = await getOpportunities(MOCK_ORG_ID)
    expect(opps.length).toBeGreaterThan(0)
    opps.forEach(o => expect(o.organization_id).toBe(MOCK_ORG_ID))
  })

  it('getOpportunities filters by status', async () => {
    const { getOpportunities } = await import('@/server/dal/opportunities')
    const approved = await getOpportunities(MOCK_ORG_ID, { status: 'approved' })
    approved.forEach(o => expect(o.status).toBe('approved'))
  })

  it('getAIRuns returns runs for org', async () => {
    const { getAIRuns } = await import('@/server/dal/ai-runs')
    const runs = await getAIRuns(MOCK_ORG_ID)
    expect(runs.length).toBeGreaterThan(0)
  })

  it('getActiveAIRuns returns only running/queued', async () => {
    const { getActiveAIRuns } = await import('@/server/dal/ai-runs')
    const active = await getActiveAIRuns(MOCK_ORG_ID)
    active.forEach(r => expect(['running', 'queued']).toContain(r.status))
  })
})
```

- [ ] **Step 2: Run to verify tests fail**

```bash
npm test -- __tests__/dal.test.ts
```

Expected: FAIL — modules not found.

- [ ] **Step 3: Create server/dal/organizations.ts**

```typescript
import type { Organization } from '@/types'
import { mockOrganizations } from '@/lib/mock'
import { createServiceClient } from '@/lib/supabase/server'

export async function getOrganizations(): Promise<Organization[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockOrganizations
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase.from('organizations').select('*')
  if (error) throw error
  return data ?? []
}

export async function getOrganizationById(id: string): Promise<Organization | null> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockOrganizations.find(o => o.id === id) ?? null
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockOrganizations.find(o => o.slug === slug) ?? null
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}
```

- [ ] **Step 4: Create server/dal/business-profiles.ts**

```typescript
import type { BusinessProfile } from '@/types'
import { mockBusinessProfiles } from '@/lib/mock'
import { createServiceClient } from '@/lib/supabase/server'

export async function getBusinessProfiles(orgId: string): Promise<BusinessProfile[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockBusinessProfiles.filter(p => p.organization_id === orgId)
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getBusinessProfileById(id: string): Promise<BusinessProfile | null> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockBusinessProfiles.find(p => p.id === id) ?? null
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function getLatestBusinessProfile(orgId: string): Promise<BusinessProfile | null> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const profiles = mockBusinessProfiles
      .filter(p => p.organization_id === orgId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    return profiles[0] ?? null
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('organization_id', orgId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()
  if (error) return null
  return data
}
```

- [ ] **Step 5: Create server/dal/opportunities.ts**

```typescript
import type { Opportunity, OpportunityStatus } from '@/types'
import { mockOpportunities } from '@/lib/mock'
import { createServiceClient } from '@/lib/supabase/server'

interface GetOpportunitiesOptions {
  status?: OpportunityStatus
  minScore?: number
  limit?: number
}

export async function getOpportunities(
  orgId: string,
  options: GetOpportunitiesOptions = {}
): Promise<Opportunity[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    let results = mockOpportunities.filter(o => o.organization_id === orgId)
    if (options.status) results = results.filter(o => o.status === options.status)
    if (options.minScore !== undefined) results = results.filter(o => o.score >= options.minScore!)
    results = results.sort((a, b) => b.score - a.score)
    if (options.limit) results = results.slice(0, options.limit)
    return results
  }
  const supabase = await createServiceClient()
  let query = supabase
    .from('opportunities')
    .select('*')
    .eq('organization_id', orgId)
    .order('score', { ascending: false })
  if (options.status) query = query.eq('status', options.status)
  if (options.minScore !== undefined) query = query.gte('score', options.minScore)
  if (options.limit) query = query.limit(options.limit)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockOpportunities.find(o => o.id === id) ?? null
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}
```

- [ ] **Step 6: Create server/dal/outreach-drafts.ts**

```typescript
import type { OutreachDraft, OutreachStatus } from '@/types'
import { mockOutreachDrafts } from '@/lib/mock'
import { createServiceClient } from '@/lib/supabase/server'

export async function getOutreachDrafts(
  orgId: string,
  options: { status?: OutreachStatus; opportunityId?: string } = {}
): Promise<OutreachDraft[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    let results = mockOutreachDrafts.filter(d => d.organization_id === orgId)
    if (options.status) results = results.filter(d => d.status === options.status)
    if (options.opportunityId) results = results.filter(d => d.opportunity_id === options.opportunityId)
    return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
  const supabase = await createServiceClient()
  let query = supabase
    .from('outreach_drafts')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
  if (options.status) query = query.eq('status', options.status)
  if (options.opportunityId) query = query.eq('opportunity_id', options.opportunityId)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getPendingApprovalDrafts(orgId: string): Promise<OutreachDraft[]> {
  return getOutreachDrafts(orgId, { status: 'draft' })
}
```

- [ ] **Step 7: Create server/dal/memory-entries.ts**

```typescript
import type { MemoryEntry, MemoryEntryType } from '@/types'
import { mockMemoryEntries } from '@/lib/mock'
import { createServiceClient } from '@/lib/supabase/server'

export async function getMemoryEntries(
  orgId: string,
  options: { type?: MemoryEntryType; relatedCompany?: string; limit?: number } = {}
): Promise<MemoryEntry[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    let results = mockMemoryEntries.filter(m => m.organization_id === orgId)
    if (options.type) results = results.filter(m => m.entry_type === options.type)
    if (options.relatedCompany) results = results.filter(m => m.related_company === options.relatedCompany)
    results = results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    if (options.limit) results = results.slice(0, options.limit)
    return results
  }
  const supabase = await createServiceClient()
  let query = supabase
    .from('memory_entries')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
  if (options.type) query = query.eq('entry_type', options.type)
  if (options.relatedCompany) query = query.eq('related_company', options.relatedCompany)
  if (options.limit) query = query.limit(options.limit)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}
```

- [ ] **Step 8: Create server/dal/ai-runs.ts**

```typescript
import type { AIRun, AgentType, AIRunStatus } from '@/types'
import { mockAIRuns, mockAgentLogs } from '@/lib/mock'
import type { AgentLog } from '@/types'
import { createServiceClient } from '@/lib/supabase/server'

export async function getAIRuns(
  orgId: string,
  options: { agentType?: AgentType; status?: AIRunStatus; limit?: number } = {}
): Promise<AIRun[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    let results = mockAIRuns.filter(r => r.organization_id === orgId)
    if (options.agentType) results = results.filter(r => r.agent_type === options.agentType)
    if (options.status) results = results.filter(r => r.status === options.status)
    results = results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    if (options.limit) results = results.slice(0, options.limit)
    return results
  }
  const supabase = await createServiceClient()
  let query = supabase
    .from('ai_runs')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
  if (options.agentType) query = query.eq('agent_type', options.agentType)
  if (options.status) query = query.eq('status', options.status)
  if (options.limit) query = query.limit(options.limit)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getActiveAIRuns(orgId: string): Promise<AIRun[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockAIRuns.filter(
      r => r.organization_id === orgId && ['running', 'queued'].includes(r.status)
    )
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('ai_runs')
    .select('*')
    .eq('organization_id', orgId)
    .in('status', ['running', 'queued'])
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getAgentLogsForRun(runId: string): Promise<AgentLog[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockAgentLogs
      .filter(l => l.ai_run_id === runId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('agent_logs')
    .select('*')
    .eq('ai_run_id', runId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}
```

- [ ] **Step 9: Create server/dal/analytics-snapshots.ts**

```typescript
import type { AnalyticsSnapshot } from '@/types'
import { mockAnalyticsSnapshots } from '@/lib/mock'
import { createServiceClient } from '@/lib/supabase/server'

export async function getAnalyticsSnapshots(
  orgId: string,
  options: { days?: number } = {}
): Promise<AnalyticsSnapshot[]> {
  const days = options.days ?? 30
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return mockAnalyticsSnapshots
      .filter(s => s.organization_id === orgId && new Date(s.snapshot_date) >= cutoff)
      .sort((a, b) => new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime())
  }
  const supabase = await createServiceClient()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  const { data, error } = await supabase
    .from('analytics_snapshots')
    .select('*')
    .eq('organization_id', orgId)
    .gte('snapshot_date', cutoffDate.toISOString().split('T')[0])
    .order('snapshot_date', { ascending: true })
  if (error) throw error
  return data ?? []
}
```

- [ ] **Step 10: Run the DAL tests**

```bash
npm test -- __tests__/dal.test.ts
```

Expected: `6 passed`

- [ ] **Step 11: Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 12: Commit**

```bash
git add server/ __tests__/
git commit -m "feat: implement data access layer with mock/real switching"
```

---

## Phase 1 Complete

At this point you have:
- All dependencies installed
- Vitest test runner configured and passing
- Complete TypeScript entity types for all 8 database tables
- Design system tokens in globals.css
- Supabase clients (browser + server)
- Full PostgreSQL schema with RLS policies and pgvector
- Realistic mock data fixtures for all entities
- DAL functions for all tables with mock/real switching

**Proceed to Phase 2:** `docs/superpowers/plans/2026-05-11-winglo-foundation-phase-2.md`
