# Winglo Foundation — Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the AI provider abstraction layer, install shadcn/ui, implement the layout shell (top bar + collapsible sidebar), create all page shells with loading/empty/error states, and verify the full build.

**Architecture:** OpenAI provider implements a shared `AIProvider` interface; Anthropic is a ready stub. Zustand manages sidebar collapse state (persisted to localStorage). Shell layout uses Framer Motion for sidebar animation. All page routes are Server Components wrapping feature skeletons.

**Prerequisites:** Phase 1 complete — types, DAL, mock fixtures, and design tokens must exist before starting.

**Spec:** `docs/superpowers/specs/2026-05-11-winglo-foundation-design.md`

---

## File Map

```
Created:
  lib/ai/providers/types.ts
  lib/ai/providers/openai.ts
  lib/ai/providers/anthropic.ts
  lib/ai/providers/mock.ts
  lib/ai/providers/index.ts
  lib/ai/mocks/index.ts
  lib/ai/prompts/intake-agent.ts
  lib/ai/prompts/research-agent.ts
  lib/ai/prompts/discovery-agent.ts
  lib/ai/prompts/scoring-agent.ts
  lib/ai/prompts/outreach-agent.ts
  lib/ai/prompts/memory-agent.ts
  lib/ai/prompts/analytics-agent.ts
  lib/stores/sidebar-store.ts
  components/providers/query-provider.tsx
  components/providers/index.tsx
  components/layout/shell-layout.tsx
  components/layout/top-bar/index.tsx
  components/layout/top-bar/org-switcher.tsx
  components/layout/top-bar/agent-status-indicator.tsx
  components/layout/top-bar/notification-bell.tsx
  components/layout/top-bar/user-menu.tsx
  components/layout/sidebar/index.tsx
  components/layout/sidebar/nav-items.tsx
  components/layout/sidebar/collapse-toggle.tsx
  components/shared/page-header.tsx
  components/shared/skeleton.tsx
  components/shared/empty-state.tsx
  components/shared/error-card.tsx
  app/(dashboard)/layout.tsx
  app/(dashboard)/dashboard/page.tsx
  app/(dashboard)/intake/page.tsx
  app/(dashboard)/opportunities/page.tsx
  app/(dashboard)/outreach/page.tsx
  app/(dashboard)/memory/page.tsx
  app/(dashboard)/analytics/page.tsx
  app/(dashboard)/settings/page.tsx
  app/(auth)/login/page.tsx
  features/dashboard/components/dashboard-skeleton.tsx
  features/intake/components/intake-skeleton.tsx
  features/opportunities/components/opportunities-skeleton.tsx
  features/outreach/components/outreach-skeleton.tsx
  features/memory/components/memory-skeleton.tsx
  features/analytics/components/analytics-skeleton.tsx

Modified:
  app/layout.tsx             ← add dark class, wrap with providers
  app/page.tsx               ← redirect to /dashboard
  tsconfig.json              ← verify paths alias
```

---

## Task 9: AI Provider Abstraction Layer

**Files:**
- Create: `lib/ai/providers/types.ts`
- Create: `lib/ai/providers/openai.ts`
- Create: `lib/ai/providers/anthropic.ts`
- Create: `lib/ai/providers/mock.ts`
- Create: `lib/ai/providers/index.ts`
- Create: `lib/ai/mocks/index.ts`

- [ ] **Step 1: Write the failing provider test**

Create `__tests__/ai-provider.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { vi } from 'vitest'

vi.stubEnv('NEXT_PUBLIC_USE_MOCK_DATA', 'true')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'placeholder')
vi.stubEnv('OPENAI_API_KEY', 'sk-placeholder')

describe('AI provider', () => {
  it('mock provider returns a CompletionResult', async () => {
    const { ai } = await import('@/lib/ai/providers/index')
    const result = await ai.complete({ messages: [{ role: 'user', content: 'test' }] })
    expect(result).toHaveProperty('content')
    expect(result).toHaveProperty('tokensUsed')
    expect(result).toHaveProperty('model')
    expect(result).toHaveProperty('durationMs')
  })
})
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npm test -- __tests__/ai-provider.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create lib/ai/providers/types.ts**

```typescript
import type { ZodSchema } from 'zod'

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface CompletionOptions<T = string> {
  messages: Message[]
  model?: string
  temperature?: number
  maxTokens?: number
  schema?: ZodSchema<T>
  systemPrompt?: string
}

export interface CompletionResult<T = string> {
  content: T
  tokensUsed: number
  model: string
  durationMs: number
}

export interface AIProvider {
  complete<T = string>(options: CompletionOptions<T>): Promise<CompletionResult<T>>
  stream(options: CompletionOptions): AsyncIterable<string>
}
```

- [ ] **Step 4: Create lib/ai/mocks/index.ts**

```typescript
export const mockCompletions: Record<string, string> = {
  default: JSON.stringify({
    summary: 'Mock AI response for development mode',
    result: 'This is a placeholder response generated by MockProvider.',
  }),
}

export function getMockCompletion(agentType?: string): string {
  return mockCompletions[agentType ?? 'default'] ?? mockCompletions.default
}
```

- [ ] **Step 5: Create lib/ai/providers/mock.ts**

```typescript
import type { AIProvider, CompletionOptions, CompletionResult } from './types'
import { getMockCompletion } from '../mocks'

export class MockProvider implements AIProvider {
  async complete<T = string>(options: CompletionOptions<T>): Promise<CompletionResult<T>> {
    const rawContent = getMockCompletion()
    const content = options.schema
      ? options.schema.parse(JSON.parse(rawContent))
      : (rawContent as T)

    return {
      content,
      tokensUsed: 0,
      model: 'mock',
      durationMs: 0,
    }
  }

  async *stream(options: CompletionOptions): AsyncIterable<string> {
    yield getMockCompletion()
  }
}
```

- [ ] **Step 6: Create lib/ai/providers/openai.ts**

```typescript
import OpenAI from 'openai'
import type { AIProvider, CompletionOptions, CompletionResult } from './types'
import { env } from '@/lib/env'

const DEFAULT_MODEL = 'gpt-4o'
const MAX_RETRIES = 3

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export class OpenAIProvider implements AIProvider {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({ apiKey: env.openaiApiKey })
  }

  async complete<T = string>(options: CompletionOptions<T>): Promise<CompletionResult<T>> {
    const model = options.model ?? DEFAULT_MODEL
    const messages = options.systemPrompt
      ? [{ role: 'system' as const, content: options.systemPrompt }, ...options.messages]
      : options.messages

    let lastError: Error | null = null

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const start = Date.now()
        const response = await this.client.chat.completions.create({
          model,
          messages,
          temperature: options.temperature ?? 0.3,
          max_tokens: options.maxTokens ?? 2000,
          response_format: options.schema ? { type: 'json_object' } : undefined,
        })

        const durationMs = Date.now() - start
        const rawContent = response.choices[0]?.message?.content ?? ''
        const tokensUsed = response.usage?.total_tokens ?? 0

        const content = options.schema
          ? options.schema.parse(JSON.parse(rawContent))
          : (rawContent as T)

        return { content, tokensUsed, model, durationMs }
      } catch (error) {
        lastError = error as Error
        const isRateLimit = (error as { status?: number }).status === 429
        const isServerError = (error as { status?: number }).status === 500

        if ((isRateLimit || isServerError) && attempt < MAX_RETRIES) {
          await sleep(Math.pow(2, attempt) * 1000)
          continue
        }
        throw error
      }
    }

    throw lastError
  }

  async *stream(options: CompletionOptions): AsyncIterable<string> {
    const messages = options.systemPrompt
      ? [{ role: 'system' as const, content: options.systemPrompt }, ...options.messages]
      : options.messages

    const stream = await this.client.chat.completions.create({
      model: options.model ?? DEFAULT_MODEL,
      messages,
      stream: true,
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content
      if (delta) yield delta
    }
  }
}
```

- [ ] **Step 7: Create lib/ai/providers/anthropic.ts**

```typescript
import type { AIProvider, CompletionOptions, CompletionResult } from './types'

export class AnthropicProvider implements AIProvider {
  async complete<T = string>(_options: CompletionOptions<T>): Promise<CompletionResult<T>> {
    throw new Error(
      'AnthropicProvider is not yet implemented. Set AI_PROVIDER=openai or implement using @anthropic-ai/sdk.'
    )
  }

  async *stream(_options: CompletionOptions): AsyncIterable<string> {
    throw new Error('AnthropicProvider streaming is not yet implemented.')
  }
}
```

- [ ] **Step 8: Create lib/ai/providers/index.ts**

```typescript
import { env } from '@/lib/env'
import { MockProvider } from './mock'
import { OpenAIProvider } from './openai'
import { AnthropicProvider } from './anthropic'
import type { AIProvider } from './types'

function createProvider(): AIProvider {
  if (env.useMockData) return new MockProvider()
  if (env.aiProvider === 'anthropic') return new AnthropicProvider()
  return new OpenAIProvider()
}

export const ai: AIProvider = createProvider()
export type { AIProvider, CompletionOptions, CompletionResult, Message } from './types'
```

- [ ] **Step 9: Run the provider test**

```bash
npm test -- __tests__/ai-provider.test.ts
```

Expected: `1 passed`

- [ ] **Step 10: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 11: Commit**

```bash
git add lib/ai/ __tests__/ai-provider.test.ts
git commit -m "feat: implement AI provider abstraction with OpenAI, Anthropic stub, and mock"
```

---

## Task 10: AI Prompt Scaffolds

**Files:**
- Create: `lib/ai/prompts/intake-agent.ts`
- Create: `lib/ai/prompts/research-agent.ts`
- Create: `lib/ai/prompts/discovery-agent.ts`
- Create: `lib/ai/prompts/scoring-agent.ts`
- Create: `lib/ai/prompts/outreach-agent.ts`
- Create: `lib/ai/prompts/memory-agent.ts`
- Create: `lib/ai/prompts/analytics-agent.ts`

- [ ] **Step 1: Create lib/ai/prompts/intake-agent.ts**

```typescript
import { z } from 'zod'
import type { Message } from '@/lib/ai/providers/types'

export const systemPrompt = `You are the Intake Agent for Winglo Growth Agent — an AI-powered Head of Growth & Partnerships system.

Your job is to analyze a business and extract structured intelligence that will be used by other agents to discover partnerships and generate outreach.

When given a website URL and/or business description, you must extract:
1. Ideal Customer Profile (ICP): company size, industry, role, pain points, budget range
2. Positioning: value proposition, differentiators, competitors, market category
3. Growth Brief: summary, partnership opportunities, recommended channels, partnership categories

Be specific and data-driven. Avoid generic statements. Your output is directly used by the Discovery Agent.`

export const outputSchema = z.object({
  icp: z.object({
    company_size: z.string(),
    industry: z.string(),
    role: z.string(),
    pain_points: z.array(z.string()),
    budget_range: z.string(),
  }),
  positioning: z.object({
    value_proposition: z.string(),
    differentiators: z.array(z.string()),
    competitors: z.array(z.string()),
    category: z.string(),
  }),
  growth_brief: z.object({
    summary: z.string(),
    opportunities: z.array(z.string()),
    recommended_channels: z.array(z.string()),
    partnership_categories: z.array(z.string()),
  }),
})

export type IntakeOutput = z.infer<typeof outputSchema>

export function formatInput(data: {
  websiteUrl?: string
  description?: string
  name: string
}): Message[] {
  return [
    {
      role: 'user',
      content: `Analyze this business and extract structured growth intelligence.

Business Name: ${data.name}
${data.websiteUrl ? `Website: ${data.websiteUrl}` : ''}
${data.description ? `Description: ${data.description}` : ''}

Return a JSON object matching the required schema.`,
    },
  ]
}
```

- [ ] **Step 2: Create lib/ai/prompts/research-agent.ts**

```typescript
import { z } from 'zod'
import type { Message } from '@/lib/ai/providers/types'

export const systemPrompt = `You are the Research Agent for Winglo Growth Agent.

Your job is to research a specific company and return structured intelligence about them — their products, customers, partner ecosystem, and relevance to a given business.

Be factual and specific. Do not invent data. If you don't know something, say so.`

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
})

export type ResearchOutput = z.infer<typeof outputSchema>

export function formatInput(data: { companyName: string; companyUrl?: string }): Message[] {
  return [
    {
      role: 'user',
      content: `Research this company and return structured intelligence.

Company: ${data.companyName}
${data.companyUrl ? `URL: ${data.companyUrl}` : ''}

Return a JSON object matching the required schema.`,
    },
  ]
}
```

- [ ] **Step 3: Create lib/ai/prompts/discovery-agent.ts**

```typescript
import { z } from 'zod'
import type { Message } from '@/lib/ai/providers/types'
import type { BusinessProfile } from '@/types'

export const systemPrompt = `You are the Partnership Discovery Agent for Winglo Growth Agent.

Your job is to discover strategic partnership opportunities for a given business. You have deep knowledge of B2B software ecosystems, distribution channels, and co-marketing strategies.

For each opportunity, identify the company, the type of partnership (integration, co-marketing, reseller, distribution, technology, strategic), and the strategic rationale.

Return 5–10 high-quality opportunities, ranked by likely strategic fit.`

export const outputSchema = z.object({
  opportunities: z.array(
    z.object({
      company_name: z.string(),
      company_url: z.string().optional(),
      opportunity_type: z.enum(['integration', 'co-marketing', 'reseller', 'distribution', 'technology', 'strategic']),
      rationale: z.string(),
      estimated_impact: z.string(),
    })
  ),
})

export type DiscoveryOutput = z.infer<typeof outputSchema>

export function formatInput(profile: BusinessProfile): Message[] {
  return [
    {
      role: 'user',
      content: `Discover partnership opportunities for this business.

Company: ${profile.name}
Description: ${profile.description ?? 'N/A'}
Category: ${profile.positioning?.category ?? 'N/A'}
ICP: ${profile.icp ? JSON.stringify(profile.icp, null, 2) : 'N/A'}
Partnership Categories: ${profile.growth_brief?.partnership_categories?.join(', ') ?? 'N/A'}

Return 5–10 partnership opportunities as JSON.`,
    },
  ]
}
```

- [ ] **Step 4: Create lib/ai/prompts/scoring-agent.ts**

```typescript
import { z } from 'zod'
import type { Message } from '@/lib/ai/providers/types'
import type { BusinessProfile, Opportunity } from '@/types'

export const systemPrompt = `You are the Scoring Agent for Winglo Growth Agent.

Your job is to evaluate the strategic fit between a business and a potential partner and assign a score from 0–100.

Score based on four dimensions:
- Strategic fit (how well missions align)
- Audience overlap (shared ICP)
- Growth potential (estimated business impact)
- Ease of execution (how tractable the partnership is)

Return a score, a rationale for each dimension, and an estimated impact statement.`

export const outputSchema = z.object({
  score: z.number().int().min(0).max(100),
  score_rationale: z.object({
    strategic_fit: z.string(),
    audience_overlap: z.string(),
    growth_potential: z.string(),
    ease_of_execution: z.string(),
  }),
  estimated_impact: z.string(),
})

export type ScoringOutput = z.infer<typeof outputSchema>

export function formatInput(
  profile: BusinessProfile,
  opportunity: Pick<Opportunity, 'company_name' | 'company_description' | 'opportunity_type'>
): Message[] {
  return [
    {
      role: 'user',
      content: `Score the strategic fit between these two companies.

Our Company: ${profile.name}
Description: ${profile.description ?? 'N/A'}
ICP: ${JSON.stringify(profile.icp, null, 2)}

Potential Partner: ${opportunity.company_name}
Description: ${opportunity.company_description ?? 'N/A'}
Partnership Type: ${opportunity.opportunity_type}

Return score and rationale as JSON.`,
    },
  ]
}
```

- [ ] **Step 5: Create lib/ai/prompts/outreach-agent.ts**

```typescript
import { z } from 'zod'
import type { Message } from '@/lib/ai/providers/types'
import type { BusinessProfile, Opportunity, OutreachChannel, OutreachTone } from '@/types'

export const systemPrompt = `You are the Outreach Agent for Winglo Growth Agent.

Your job is to write high-quality, personalized partnership outreach messages.

Rules:
- Write in the specified tone (professional, warm, or direct)
- Be specific about the shared value — never generic
- Reference concrete shared customers or data points when available
- Keep emails under 250 words
- Keep LinkedIn messages under 100 words
- Proposals can be longer (400–600 words) and more structured

Do not use buzzwords. Do not be sycophantic. Write like a senior BD person would.`

export const outputSchema = z.object({
  subject: z.string().optional(),
  body: z.string(),
})

export type OutreachOutput = z.infer<typeof outputSchema>

export function formatInput(data: {
  profile: BusinessProfile
  opportunity: Opportunity
  channel: OutreachChannel
  tone: OutreachTone
}): Message[] {
  return [
    {
      role: 'user',
      content: `Write a ${data.channel} outreach message for this partnership.

Our Company: ${data.profile.name}
Our Value Prop: ${data.profile.positioning?.value_proposition ?? 'N/A'}

Partner Company: ${data.opportunity.company_name}
Partnership Type: ${data.opportunity.opportunity_type}
Why this partnership: ${data.opportunity.score_rationale?.strategic_fit ?? 'Strong strategic fit'}

Channel: ${data.channel}
Tone: ${data.tone}

${data.channel === 'email' ? 'Include a subject line.' : 'No subject line needed.'}

Return JSON with subject (if email) and body.`,
    },
  ]
}
```

- [ ] **Step 6: Create lib/ai/prompts/memory-agent.ts**

```typescript
import { z } from 'zod'
import type { Message } from '@/lib/ai/providers/types'

export const systemPrompt = `You are the Memory Agent for Winglo Growth Agent.

Your job is to extract structured learnings from raw notes, conversation summaries, or unstructured text and store them as memory entries.

Each memory entry should have:
- A clear, specific title (what happened or what was learned)
- A detailed body (the full context)
- An entry type: partner_interaction, learning, or observation
- A related company name if applicable

Focus on information that would be useful to recall months from now when working with the same partner.`

export const outputSchema = z.object({
  title: z.string(),
  body: z.string(),
  entry_type: z.enum(['partner_interaction', 'learning', 'observation']),
  related_company: z.string().optional(),
})

export type MemoryOutput = z.infer<typeof outputSchema>

export function formatInput(data: { rawNotes: string; context?: string }): Message[] {
  return [
    {
      role: 'user',
      content: `Extract a structured memory entry from these notes.

${data.context ? `Context: ${data.context}\n` : ''}Notes:
${data.rawNotes}

Return a JSON memory entry.`,
    },
  ]
}
```

- [ ] **Step 7: Create lib/ai/prompts/analytics-agent.ts**

```typescript
import { z } from 'zod'
import type { Message } from '@/lib/ai/providers/types'
import type { AnalyticsSnapshot } from '@/types'

export const systemPrompt = `You are the Analytics Agent for Winglo Growth Agent.

Your job is to analyze growth and partnership performance data and generate actionable insights and recommendations.

Focus on:
- Trends (improving, declining, flat)
- Anomalies worth investigating
- Specific, actionable recommendations

Be concise. One insight per bullet. No padding.`

export const outputSchema = z.object({
  summary: z.string(),
  insights: z.array(z.string()),
  recommendations: z.array(z.string()),
  highlight_metric: z.object({
    label: z.string(),
    value: z.string(),
    trend: z.enum(['up', 'down', 'flat']),
  }),
})

export type AnalyticsOutput = z.infer<typeof outputSchema>

export function formatInput(snapshots: AnalyticsSnapshot[]): Message[] {
  const recent = snapshots.slice(-30)
  return [
    {
      role: 'user',
      content: `Analyze this growth performance data and return insights.

Data (last ${recent.length} days):
${JSON.stringify(recent.map(s => ({ date: s.snapshot_date, ...s.metrics })), null, 2)}

Return JSON with summary, insights array, recommendations array, and a highlight metric.`,
    },
  ]
}
```

- [ ] **Step 8: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add lib/ai/prompts/
git commit -m "feat: scaffold AI agent prompt definitions for all 7 agents"
```

---

## Task 11: Zustand Store and React Query Provider

**Files:**
- Create: `lib/stores/sidebar-store.ts`
- Create: `components/providers/query-provider.tsx`
- Create: `components/providers/index.tsx`

- [ ] **Step 1: Write failing store test**

Create `__tests__/sidebar-store.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useSidebarStore } from '@/lib/stores/sidebar-store'
import { act } from '@testing-library/react'

describe('sidebar store', () => {
  beforeEach(() => {
    useSidebarStore.setState({ collapsed: false })
  })

  it('starts uncollapsed', () => {
    expect(useSidebarStore.getState().collapsed).toBe(false)
  })

  it('toggles collapsed state', () => {
    act(() => useSidebarStore.getState().toggle())
    expect(useSidebarStore.getState().collapsed).toBe(true)
    act(() => useSidebarStore.getState().toggle())
    expect(useSidebarStore.getState().collapsed).toBe(false)
  })

  it('setCollapsed sets exact value', () => {
    act(() => useSidebarStore.getState().setCollapsed(true))
    expect(useSidebarStore.getState().collapsed).toBe(true)
  })
})
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npm test -- __tests__/sidebar-store.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create lib/stores/sidebar-store.ts**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  collapsed: boolean
  toggle: () => void
  setCollapsed: (value: boolean) => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((state) => ({ collapsed: !state.collapsed })),
      setCollapsed: (value) => set({ collapsed: value }),
    }),
    {
      name: 'winglo-sidebar',
    }
  )
)
```

- [ ] **Step 4: Run the store test**

```bash
npm test -- __tests__/sidebar-store.test.ts
```

Expected: `3 passed`

- [ ] **Step 5: Create components/providers/query-provider.tsx**

```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
```

- [ ] **Step 6: Create components/providers/index.tsx**

```typescript
'use client'

import { QueryProvider } from './query-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>
}
```

- [ ] **Step 7: Commit**

```bash
git add lib/stores/ components/providers/ __tests__/sidebar-store.test.ts
git commit -m "feat: add sidebar Zustand store and React Query provider"
```

---

## Task 12: shadcn/ui Initialization and Shared Components

**Files:**
- Modify: `app/globals.css` (shadcn will append)
- Create: `components/ui/` (shadcn output)
- Create: `components/shared/page-header.tsx`
- Create: `components/shared/skeleton.tsx`
- Create: `components/shared/empty-state.tsx`
- Create: `components/shared/error-card.tsx`

- [ ] **Step 1: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted:
- Style: `Default`
- Base color: `Neutral`
- CSS variables: `Yes`
- Tailwind config: use the existing one (Tailwind v4)

This creates `components.json` and updates `globals.css` with shadcn CSS variables. It will also create `lib/utils.ts` if it doesn't exist — ours already exists, so skip overwriting it.

- [ ] **Step 2: Install required shadcn components**

```bash
npx shadcn@latest add button badge tooltip dropdown-menu separator avatar
```

This adds component files to `components/ui/`.

- [ ] **Step 3: Verify dev server runs after shadcn init**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected: no CSS import errors, page renders. Stop with `Ctrl+C`.

- [ ] **Step 4: Create components/shared/page-header.tsx**

```typescript
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-6', className)}>
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
```

- [ ] **Step 5: Create components/shared/skeleton.tsx**

```typescript
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[var(--surface-raised)]',
        className
      )}
    />
  )
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-4 space-y-3',
        className
      )}
    >
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  )
}

export function SkeletonRow({ className }: SkeletonProps) {
  return (
    <div className={cn('flex items-center gap-3 py-3', className)}>
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  )
}
```

- [ ] **Step 6: Create components/shared/empty-state.tsx**

```typescript
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-8 text-center',
        'rounded-lg border border-dashed border-[var(--border-strong)]',
        className
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--surface-raised)] text-[var(--text-muted)] mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-muted)] max-w-xs mb-4">{description}</p>
      )}
      {action}
    </div>
  )
}
```

- [ ] **Step 7: Create components/shared/error-card.tsx**

```typescript
'use client'

import { cn } from '@/lib/utils'

interface ErrorCardProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorCard({
  message = 'Something went wrong.',
  onRetry,
  className,
}: ErrorCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--destructive)]/20 bg-[var(--destructive)]/5 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-4 h-4 mt-0.5 text-[var(--destructive)]">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.75 3.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5zm.75 7a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--text-primary)]">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-xs text-[var(--accent)] hover:underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add components/ components.json
git commit -m "feat: init shadcn/ui and add shared layout components"
```

---

## Task 13: Root Layout Update

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Update app/layout.tsx**

```typescript
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Winglo Growth Agent',
  description: 'AI-powered Head of Growth & Partnerships',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--text-primary)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Update app/page.tsx to redirect to dashboard**

```typescript
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/dashboard')
}
```

- [ ] **Step 3: Verify dev server starts and redirects**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected: browser redirects to `/dashboard` (404 is fine — route doesn't exist yet). No import errors. Stop with `Ctrl+C`.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat: configure root layout with dark mode and providers, redirect / to /dashboard"
```

---

## Task 14: Shell Layout Components

**Files:**
- Create: `components/layout/shell-layout.tsx`
- Create: `components/layout/top-bar/index.tsx`
- Create: `components/layout/top-bar/org-switcher.tsx`
- Create: `components/layout/top-bar/agent-status-indicator.tsx`
- Create: `components/layout/top-bar/notification-bell.tsx`
- Create: `components/layout/top-bar/user-menu.tsx`
- Create: `components/layout/sidebar/index.tsx`
- Create: `components/layout/sidebar/nav-items.tsx`
- Create: `components/layout/sidebar/collapse-toggle.tsx`

- [ ] **Step 1: Create components/layout/top-bar/org-switcher.tsx**

```typescript
'use client'

import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { mockOrganizations, MOCK_ORG_ID } from '@/lib/mock'

export function OrgSwitcher() {
  const currentOrg = mockOrganizations.find(o => o.id === MOCK_ORG_ID)!

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-raised)] transition-colors">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-[var(--accent)] text-white text-xs font-semibold shrink-0">
            {currentOrg.name.charAt(0)}
          </div>
          <span className="max-w-[140px] truncate">{currentOrg.name}</span>
          <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-48 bg-[var(--surface-raised)] border-[var(--border-color)]"
      >
        {mockOrganizations.map(org => (
          <DropdownMenuItem
            key={org.id}
            className="flex items-center gap-2 text-sm cursor-pointer"
          >
            <div className="flex items-center justify-center w-5 h-5 rounded bg-[var(--surface)] text-[var(--text-secondary)] text-xs font-semibold shrink-0">
              {org.name.charAt(0)}
            </div>
            {org.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

- [ ] **Step 2: Create components/layout/top-bar/agent-status-indicator.tsx**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { mockAIRuns } from '@/lib/mock'

export function AgentStatusIndicator() {
  const [activeCount, setActiveCount] = useState(0)

  useEffect(() => {
    const active = mockAIRuns.filter(r =>
      ['running', 'queued'].includes(r.status)
    ).length
    setActiveCount(active)
  }, [])

  if (activeCount === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] px-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" />
        <span>Idle</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--success)] px-2">
      <span className="relative flex w-1.5 h-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75" />
        <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-[var(--success)]" />
      </span>
      <span>{activeCount} agent{activeCount > 1 ? 's' : ''} running</span>
    </div>
  )
}
```

- [ ] **Step 3: Create components/layout/top-bar/notification-bell.tsx**

```typescript
'use client'

import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const mockNotifications = [
  { id: '1', text: 'Salesforce outreach approved', time: '2m ago' },
  { id: '2', text: 'Discovery agent found 3 new opportunities', time: '1h ago' },
  { id: '3', text: 'G2 email sent successfully', time: '3h ago' },
]

export function NotificationBell() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 bg-[var(--surface-raised)] border-[var(--border-color)]"
      >
        {mockNotifications.map(n => (
          <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2.5 cursor-pointer">
            <span className="text-sm text-[var(--text-primary)]">{n.text}</span>
            <span className="text-xs text-[var(--text-muted)]">{n.time}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

- [ ] **Step 4: Create components/layout/top-bar/user-menu.tsx**

```typescript
'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const MOCK_USER = { name: 'Alex Kim', email: 'alex@acme-ai.example.com' }

export function UserMenu() {
  const initials = MOCK_USER.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]">
          <Avatar className="w-7 h-7">
            <AvatarFallback className="bg-[var(--surface-raised)] text-[var(--text-secondary)] text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52 bg-[var(--surface-raised)] border-[var(--border-color)]"
      >
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-[var(--text-primary)]">{MOCK_USER.name}</p>
          <p className="text-xs text-[var(--text-muted)] truncate">{MOCK_USER.email}</p>
        </div>
        <DropdownMenuSeparator className="bg-[var(--border-color)]" />
        <DropdownMenuItem className="text-sm cursor-pointer">Settings</DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[var(--border-color)]" />
        <DropdownMenuItem className="text-sm text-[var(--text-muted)] cursor-pointer">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

- [ ] **Step 5: Create components/layout/top-bar/index.tsx**

```typescript
import { Separator } from '@/components/ui/separator'
import { OrgSwitcher } from './org-switcher'
import { AgentStatusIndicator } from './agent-status-indicator'
import { NotificationBell } from './notification-bell'
import { UserMenu } from './user-menu'

export function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center h-[52px] px-4 bg-[var(--surface)] border-b border-[var(--border-color)]">
      {/* Left */}
      <div className="flex items-center gap-2">
        <OrgSwitcher />
        <Separator orientation="vertical" className="h-4 bg-[var(--border-color)]" />
      </div>

      {/* Center */}
      <div className="flex-1 flex items-center justify-center">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--border-color)] bg-[var(--surface-raised)] text-sm text-[var(--text-muted)] hover:border-[var(--border-strong)] transition-colors w-64">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Search...</span>
          <span className="ml-auto text-xs border border-[var(--border-color)] rounded px-1 py-0.5">⌘K</span>
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <AgentStatusIndicator />
        <Separator orientation="vertical" className="h-4 bg-[var(--border-color)] mx-1" />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  )
}
```

- [ ] **Step 6: Create components/layout/sidebar/nav-items.tsx**

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5zM4 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4z" />
      </svg>
    ),
  },
  {
    label: 'Intake',
    href: '/intake',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
  {
    label: 'Opportunities',
    href: '/opportunities',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-6a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      </svg>
    ),
  },
  {
    label: 'Outreach',
    href: '/outreach',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
      </svg>
    ),
  },
  {
    label: 'Memory',
    href: '/memory',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12H3m2 0a9 9 0 1 0 18 0M5 12a9 9 0 0 1 18 0m-9 0v9m0-9V3" />
      </svg>
    ),
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
      </svg>
    ),
  },
]

interface NavItemsProps {
  collapsed: boolean
}

export function NavItems({ collapsed }: NavItemsProps) {
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="flex flex-col gap-0.5 px-2">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          const linkContent = (
            <Link
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors relative group',
                isActive
                  ? 'text-[var(--text-primary)] bg-[var(--surface-raised)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)]'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[var(--accent)] rounded-r-full" />
              )}
              <span className={cn('shrink-0', isActive && 'text-[var(--accent)]')}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate font-medium">{item.label}</span>}
            </Link>
          )

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="bg-[var(--surface-raised)] border-[var(--border-color)] text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          }

          return <div key={item.href}>{linkContent}</div>
        })}
      </nav>
    </TooltipProvider>
  )
}
```

- [ ] **Step 7: Create components/layout/sidebar/collapse-toggle.tsx**

```typescript
'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface CollapseToggleProps {
  collapsed: boolean
  onToggle: () => void
}

export function CollapseToggle({ collapsed, onToggle }: CollapseToggleProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-7 h-7 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-[var(--surface-raised)] border-[var(--border-color)] text-xs">
          {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

- [ ] **Step 8: Create components/layout/sidebar/index.tsx**

```typescript
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/lib/stores/sidebar-store'
import { NavItems } from './nav-items'
import { CollapseToggle } from './collapse-toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function Sidebar() {
  const { collapsed, toggle } = useSidebarStore()
  const pathname = usePathname()
  const isSettingsActive = pathname === '/settings'

  const settingsLink = (
    <Link
      href="/settings"
      className={cn(
        'flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors',
        isSettingsActive
          ? 'text-[var(--text-primary)] bg-[var(--surface-raised)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)]'
      )}
    >
      <Settings className="w-4 h-4 shrink-0" />
      {!collapsed && <span className="font-medium">Settings</span>}
    </Link>
  )

  return (
    <motion.aside
      layout
      animate={{ width: collapsed ? 52 : 220 }}
      transition={{ duration: 0.15, ease: 'easeInOut' }}
      className="fixed left-0 top-[52px] bottom-0 z-40 flex flex-col bg-[var(--surface)] border-r border-[var(--border-color)] overflow-hidden"
    >
      {/* Main nav */}
      <div className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        <NavItems collapsed={collapsed} />
      </div>

      {/* Bottom: settings + toggle */}
      <div className="border-t border-[var(--border-color)] p-2 flex flex-col gap-1">
        <TooltipProvider delayDuration={0}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>{settingsLink}</TooltipTrigger>
              <TooltipContent side="right" className="bg-[var(--surface-raised)] border-[var(--border-color)] text-xs">
                Settings
              </TooltipContent>
            </Tooltip>
          ) : (
            settingsLink
          )}
        </TooltipProvider>
        <div className={cn('flex', collapsed ? 'justify-center' : 'justify-end')}>
          <CollapseToggle collapsed={collapsed} onToggle={toggle} />
        </div>
      </div>
    </motion.aside>
  )
}
```

- [ ] **Step 9: Create components/layout/shell-layout.tsx**

```typescript
'use client'

import { motion } from 'framer-motion'
import { TopBar } from './top-bar'
import { Sidebar } from './sidebar'
import { useSidebarStore } from '@/lib/stores/sidebar-store'

export function ShellLayout({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarStore()

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <TopBar />
      <Sidebar />
      <motion.main
        layout
        animate={{ marginLeft: collapsed ? 52 : 220 }}
        transition={{ duration: 0.15, ease: 'easeInOut' }}
        className="pt-[52px] min-h-screen"
      >
        <div className="max-w-[1280px] mx-auto px-6 py-6">
          {children}
        </div>
      </motion.main>
    </div>
  )
}
```

- [ ] **Step 10: Install lucide-react (icons)**

```bash
npm install lucide-react
```

- [ ] **Step 11: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 12: Commit**

```bash
git add components/layout/
git commit -m "feat: implement layout shell with top bar and animated sidebar"
```

---

## Task 15: Dashboard Route Group and Page Shells

**Files:**
- Create: `app/(dashboard)/layout.tsx`
- Create: `app/(dashboard)/dashboard/page.tsx`
- Create: `features/dashboard/components/dashboard-skeleton.tsx`
- Create: `app/(dashboard)/intake/page.tsx`
- Create: `features/intake/components/intake-skeleton.tsx`
- Create: `app/(dashboard)/opportunities/page.tsx`
- Create: `features/opportunities/components/opportunities-skeleton.tsx`
- Create: `app/(dashboard)/outreach/page.tsx`
- Create: `features/outreach/components/outreach-skeleton.tsx`
- Create: `app/(dashboard)/memory/page.tsx`
- Create: `features/memory/components/memory-skeleton.tsx`
- Create: `app/(dashboard)/analytics/page.tsx`
- Create: `features/analytics/components/analytics-skeleton.tsx`
- Create: `app/(dashboard)/settings/page.tsx`

- [ ] **Step 1: Create app/(dashboard)/layout.tsx**

```typescript
import { ShellLayout } from '@/components/layout/shell-layout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ShellLayout>{children}</ShellLayout>
}
```

- [ ] **Step 2: Create features/dashboard/components/dashboard-skeleton.tsx**

```typescript
import { SkeletonCard, SkeletonRow } from '@/components/shared/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Top metrics row */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} className="h-24" />
        ))}
      </div>
      {/* Two column layout */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-3">
          <SkeletonCard className="h-8 w-40" />
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
        <div className="space-y-3">
          <SkeletonCard className="h-8 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create app/(dashboard)/dashboard/page.tsx**

```typescript
import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { DashboardSkeleton } from '@/features/dashboard/components/dashboard-skeleton'
import { EmptyState } from '@/components/shared/empty-state'

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Growth operations command center"
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </>
  )
}

function DashboardContent() {
  return (
    <EmptyState
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5zM4 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4z" />
        </svg>
      }
      title="Dashboard coming in Phase 2"
      description="Start by submitting your business profile in Intake."
    />
  )
}
```

- [ ] **Step 4: Create features/intake/components/intake-skeleton.tsx**

```typescript
import { SkeletonCard } from '@/components/shared/skeleton'
import { Skeleton } from '@/components/shared/skeleton'

export function IntakeSkeleton() {
  return (
    <div className="max-w-2xl space-y-6">
      <SkeletonCard className="h-12" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  )
}
```

- [ ] **Step 5: Create app/(dashboard)/intake/page.tsx**

```typescript
import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { IntakeSkeleton } from '@/features/intake/components/intake-skeleton'
import { EmptyState } from '@/components/shared/empty-state'

export default function IntakePage() {
  return (
    <>
      <PageHeader
        title="Business Intake"
        subtitle="Submit your business for AI analysis"
      />
      <Suspense fallback={<IntakeSkeleton />}>
        <IntakeContent />
      </Suspense>
    </>
  )
}

function IntakeContent() {
  return (
    <EmptyState
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      }
      title="Intake form coming in Phase 2"
      description="The intake form will let you submit your website URL and business description for AI analysis."
    />
  )
}
```

- [ ] **Step 6: Create features/opportunities/components/opportunities-skeleton.tsx**

```typescript
import { SkeletonCard, SkeletonRow } from '@/components/shared/skeleton'
import { Skeleton } from '@/components/shared/skeleton'

export function OpportunitiesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
```

- [ ] **Step 7: Create app/(dashboard)/opportunities/page.tsx**

```typescript
import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { OpportunitiesSkeleton } from '@/features/opportunities/components/opportunities-skeleton'
import { EmptyState } from '@/components/shared/empty-state'

export default function OpportunitiesPage() {
  return (
    <>
      <PageHeader
        title="Opportunities"
        subtitle="AI-discovered partnership opportunities"
      />
      <Suspense fallback={<OpportunitiesSkeleton />}>
        <OpportunitiesContent />
      </Suspense>
    </>
  )
}

function OpportunitiesContent() {
  return (
    <EmptyState
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-6a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
        </svg>
      }
      title="No opportunities yet"
      description="Run intake analysis to discover partnership opportunities."
    />
  )
}
```

- [ ] **Step 8: Create features/outreach/components/outreach-skeleton.tsx**

```typescript
import { SkeletonCard, SkeletonRow } from '@/components/shared/skeleton'

export function OutreachSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
```

- [ ] **Step 9: Create app/(dashboard)/outreach/page.tsx**

```typescript
import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { OutreachSkeleton } from '@/features/outreach/components/outreach-skeleton'
import { EmptyState } from '@/components/shared/empty-state'

export default function OutreachPage() {
  return (
    <>
      <PageHeader
        title="Outreach"
        subtitle="AI-drafted partnership messages and proposals"
      />
      <Suspense fallback={<OutreachSkeleton />}>
        <OutreachContent />
      </Suspense>
    </>
  )
}

function OutreachContent() {
  return (
    <EmptyState
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
        </svg>
      }
      title="No drafts yet"
      description="Approve opportunities to generate AI outreach drafts."
    />
  )
}
```

- [ ] **Step 10: Create features/memory/components/memory-skeleton.tsx**

```typescript
import { SkeletonRow } from '@/components/shared/skeleton'
import { Skeleton } from '@/components/shared/skeleton'

export function MemorySkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-28 rounded-full" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 11: Create app/(dashboard)/memory/page.tsx**

```typescript
import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { MemorySkeleton } from '@/features/memory/components/memory-skeleton'
import { EmptyState } from '@/components/shared/empty-state'

export default function MemoryPage() {
  return (
    <>
      <PageHeader
        title="Memory"
        subtitle="Institutional knowledge and partner history"
      />
      <Suspense fallback={<MemorySkeleton />}>
        <MemoryContent />
      </Suspense>
    </>
  )
}

function MemoryContent() {
  return (
    <EmptyState
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12H3m2 0a9 9 0 1 0 18 0M5 12a9 9 0 0 1 18 0m-9 0v9m0-9V3" />
        </svg>
      }
      title="Memory is empty"
      description="Memory entries are created automatically as agents interact with partners."
    />
  )
}
```

- [ ] **Step 12: Create features/analytics/components/analytics-skeleton.tsx**

```typescript
import { SkeletonCard } from '@/components/shared/skeleton'
import { Skeleton } from '@/components/shared/skeleton'

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} className="h-28" />
        ))}
      </div>
      <SkeletonCard className="h-64" />
      <div className="grid grid-cols-2 gap-4">
        <SkeletonCard className="h-48" />
        <SkeletonCard className="h-48" />
      </div>
    </div>
  )
}
```

- [ ] **Step 13: Create app/(dashboard)/analytics/page.tsx**

```typescript
import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { AnalyticsSkeleton } from '@/features/analytics/components/analytics-skeleton'
import { EmptyState } from '@/components/shared/empty-state'

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Growth velocity and partnership pipeline"
      />
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsContent />
      </Suspense>
    </>
  )
}

function AnalyticsContent() {
  return (
    <EmptyState
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
        </svg>
      }
      title="No analytics data yet"
      description="Analytics snapshots are generated daily once agents are running."
    />
  )
}
```

- [ ] **Step 14: Create app/(dashboard)/settings/page.tsx**

```typescript
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Organization and account configuration"
      />
      <EmptyState
        icon={<Settings className="w-5 h-5" />}
        title="Settings coming in a future phase"
        description="Organization settings, API keys, and team management will be configured here."
      />
    </>
  )
}
```

- [ ] **Step 15: Create auth stub app/(auth)/login/page.tsx**

```typescript
import { PageHeader } from '@/components/shared/page-header'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-sm p-8 rounded-lg border border-[var(--border-color)] bg-[var(--surface)]">
        <PageHeader
          title="Winglo"
          subtitle="Sign in to your account"
        />
        <p className="text-sm text-[var(--text-muted)] mt-4">
          Authentication is not yet configured. Access the dashboard directly at{' '}
          <a href="/dashboard" className="text-[var(--accent)] hover:underline">
            /dashboard
          </a>
          .
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 16: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 17: Commit**

```bash
git add app/ features/
git commit -m "feat: add all page shells with loading, empty, and error states"
```

---

## Task 16: Final Build Verification

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: all tests pass. No failures.

- [ ] **Step 2: TypeScript strict check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Start dev server and verify visually**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify:
- [ ] Redirects to `/dashboard`
- [ ] Dark background (`#0a0a0a`) is visible
- [ ] Top bar renders with org switcher, search trigger, agent status, notification bell, user avatar
- [ ] Sidebar renders with all 6 nav items + Settings at bottom
- [ ] Active route highlights with accent left border
- [ ] Sidebar collapse toggle works — sidebar animates to icon-only
- [ ] Navigate to `/intake`, `/opportunities`, `/outreach`, `/memory`, `/analytics`, `/settings` — each renders with correct page title and empty state
- [ ] No console errors

Stop with `Ctrl+C`.

- [ ] **Step 4: Production build**

```bash
npm run build
```

Expected: build completes successfully. Zero TypeScript errors. No "Export encountered errors" messages.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: foundation phase complete — shell, providers, design system, DB schema, mock data, DAL"
```

---

## Foundation Phase Complete

The foundation is now fully in place:

| Layer | Status |
|---|---|
| Dependencies | Installed |
| TypeScript types | All 8 entities typed |
| Design system | Dark-mode tokens in globals.css |
| Supabase schema | Migration written, RLS policies, pgvector |
| Mock data | Realistic fixtures for all tables |
| DAL | All tables, mock/real switching |
| AI provider | OpenAI (real), Anthropic (stub), Mock |
| Agent prompts | All 7 agents scaffolded |
| Zustand store | Sidebar collapse, persisted |
| React Query | Provider configured |
| Layout shell | Top bar + animated sidebar |
| Page shells | All 7 routes with loading/empty/error states |
| Build | Passing |

**Next phase:** Phase 2 will implement the Intake flow (business profile submission + AI analysis) and the Opportunities board.
