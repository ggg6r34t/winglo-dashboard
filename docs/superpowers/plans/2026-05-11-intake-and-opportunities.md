# Intake Flow & Opportunities Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Intake form (business profile submission + AI analysis) and the Opportunities board (filterable list with approve/reject actions).

**Architecture:** The intake page is a Server Component that fetches the latest complete profile — if none exists it renders the form, if complete it renders the analysis display. Form submission calls a Server Action that runs the intake AI agent and persists the profile. A second Server Action (runDiscovery) chains the discovery + scoring agents and persists opportunities. The opportunities page reads URL search params server-side for filtering, while the filter bar is a Client Component that pushes new params on change.

**Tech Stack:** Next.js 16.2.6 App Router (async searchParams), React 19 `useTransition`, React Hook Form + Zod, shadcn/ui (input/textarea/label), Tailwind v4 CSS variables, `ai.complete()` abstraction from `lib/ai/providers/index.ts`, mock-mode short-circuits in all Server Actions.

**Prerequisites:** Foundation phase complete — `server/dal/`, `lib/ai/`, `lib/mock/`, `types/`, `components/shared/`, all page shells exist.

---

## File Map

```
Create:
  features/intake/validations.ts                        ← Zod schema for the intake form
  features/intake/components/intake-form.tsx            ← React Hook Form + shadcn inputs
  features/intake/components/analysis-display.tsx       ← Shows ICP / positioning / growth_brief
  features/intake/server/actions.ts                     ← analyzeBusinessProfile, runDiscovery

  features/opportunities/components/opportunity-card.tsx ← Card with score badge, type, actions
  features/opportunities/components/filter-bar.tsx       ← Status tabs + score filter
  features/opportunities/server/actions.ts               ← updateOpportunityStatus

Modify:
  server/dal/business-profiles.ts   ← add createBusinessProfile, updateBusinessProfile
  server/dal/ai-runs.ts             ← add createAIRun, updateAIRun
  server/dal/opportunities.ts       ← add createOpportunities, updateOpportunityStatus

  app/(dashboard)/intake/page.tsx          ← replace empty shell with form/display logic
  app/(dashboard)/opportunities/page.tsx   ← replace empty shell with filter + card list

Test:
  __tests__/dal.test.ts             ← add write function tests
  __tests__/intake-validation.test.ts
  __tests__/intake-actions.test.ts
```

---

## Task 1: DAL Write Functions

**Files:**
- Modify: `server/dal/business-profiles.ts`
- Modify: `server/dal/ai-runs.ts`
- Modify: `server/dal/opportunities.ts`
- Modify: `__tests__/dal.test.ts`

- [ ] **Step 1: Write the failing DAL write tests**

Add to the bottom of `__tests__/dal.test.ts` (inside the existing `describe` block):

```typescript
  it('createBusinessProfile returns a BusinessProfile in mock mode', async () => {
    const { createBusinessProfile } = await import('@/server/dal/business-profiles')
    const profile = await createBusinessProfile(MOCK_ORG_ID, {
      name: 'Test Business',
      website_url: 'https://test.example.com',
      description: 'A test business',
      status: 'draft',
    })
    expect(profile).toHaveProperty('id')
    expect(profile.name).toBe('Test Business')
    expect(profile.status).toBe('draft')
    expect(profile.organization_id).toBe(MOCK_ORG_ID)
  })

  it('updateBusinessProfile returns updated profile in mock mode', async () => {
    const { updateBusinessProfile } = await import('@/server/dal/business-profiles')
    const { MOCK_PROFILE_ID } = await import('@/lib/mock')
    const updated = await updateBusinessProfile(MOCK_PROFILE_ID, { status: 'complete' })
    expect(updated.id).toBe(MOCK_PROFILE_ID)
    expect(updated.status).toBe('complete')
  })

  it('createAIRun returns an AIRun in mock mode', async () => {
    const { createAIRun } = await import('@/server/dal/ai-runs')
    const run = await createAIRun(MOCK_ORG_ID, 'intake', { name: 'Test' })
    expect(run).toHaveProperty('id')
    expect(run.agent_type).toBe('intake')
    expect(run.status).toBe('queued')
  })

  it('updateAIRun returns updated run in mock mode', async () => {
    const { createAIRun, updateAIRun } = await import('@/server/dal/ai-runs')
    const run = await createAIRun(MOCK_ORG_ID, 'intake', {})
    const updated = await updateAIRun(run.id, { status: 'complete' })
    expect(updated.status).toBe('complete')
  })

  it('createOpportunities returns opportunities in mock mode', async () => {
    const { createOpportunities } = await import('@/server/dal/opportunities')
    const { MOCK_PROFILE_ID } = await import('@/lib/mock')
    const result = await createOpportunities(MOCK_ORG_ID, MOCK_PROFILE_ID, [])
    expect(Array.isArray(result)).toBe(true)
  })

  it('updateOpportunityStatus returns updated opportunity in mock mode', async () => {
    const { updateOpportunityStatus } = await import('@/server/dal/opportunities')
    const updated = await updateOpportunityStatus('opp-00000000-0000-0000-000000000001', 'approved')
    expect(updated.id).toBe('opp-00000000-0000-0000-000000000001')
    expect(updated.status).toBe('approved')
  })
```

- [ ] **Step 2: Run to confirm tests fail**

```bash
npm test -- __tests__/dal.test.ts
```

Expected: 6 new tests FAIL with "is not a function".

- [ ] **Step 3: Add write functions to server/dal/business-profiles.ts**

Append to the end of `server/dal/business-profiles.ts`:

```typescript
export async function createBusinessProfile(
  orgId: string,
  data: {
    name: string
    website_url: string | null
    description: string | null
    status: 'draft' | 'processing' | 'complete'
  }
): Promise<BusinessProfile> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return {
      id: `bp-mock-${Date.now()}`,
      organization_id: orgId,
      name: data.name,
      website_url: data.website_url,
      description: data.description,
      icp: null,
      positioning: null,
      growth_brief: null,
      brand_voice: null,
      target_audience: null,
      goals: [],
      status: data.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
  const supabase = await createServiceClient()
  const { data: created, error } = await supabase
    .from('business_profiles')
    .insert({ organization_id: orgId, ...data })
    .select()
    .single()
  if (error) throw error
  return created
}

export async function updateBusinessProfile(
  id: string,
  data: Partial<Pick<BusinessProfile, 'name' | 'website_url' | 'description' | 'icp' | 'positioning' | 'growth_brief' | 'brand_voice' | 'target_audience' | 'goals' | 'status'>>
): Promise<BusinessProfile> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const { mockBusinessProfiles } = await import('@/lib/mock')
    const existing = mockBusinessProfiles.find(p => p.id === id)
    if (!existing) throw new Error(`Profile ${id} not found`)
    return { ...existing, ...data, updated_at: new Date().toISOString() }
  }
  const supabase = await createServiceClient()
  const { data: updated, error } = await supabase
    .from('business_profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return updated
}
```

- [ ] **Step 4: Add write functions to server/dal/ai-runs.ts**

Append to the end of `server/dal/ai-runs.ts` (add `MOCK_ORG_ID` import at the top first: `import { mockAIRuns, MOCK_ORG_ID } from '@/lib/mock'` — update the existing import line from `import { mockAIRuns, mockAgentLogs } from '@/lib/mock'` to `import { mockAIRuns, mockAgentLogs, MOCK_ORG_ID } from '@/lib/mock'`):

```typescript
export async function createAIRun(
  orgId: string,
  agentType: AgentType,
  input: Record<string, unknown>
): Promise<AIRun> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return {
      id: `run-mock-${Date.now()}`,
      organization_id: orgId,
      agent_type: agentType,
      status: 'queued',
      input,
      output: null,
      error: null,
      duration_ms: null,
      tokens_used: null,
      started_at: null,
      completed_at: null,
      created_at: new Date().toISOString(),
    }
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('ai_runs')
    .insert({ organization_id: orgId, agent_type: agentType, input, status: 'queued' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateAIRun(
  id: string,
  data: Partial<Pick<AIRun, 'status' | 'output' | 'error' | 'duration_ms' | 'tokens_used' | 'started_at' | 'completed_at'>>
): Promise<AIRun> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const existing = mockAIRuns.find(r => r.id === id)
    const base: AIRun = existing ?? {
      id,
      organization_id: MOCK_ORG_ID,
      agent_type: 'intake',
      status: 'queued',
      input: null,
      output: null,
      error: null,
      duration_ms: null,
      tokens_used: null,
      started_at: null,
      completed_at: null,
      created_at: new Date().toISOString(),
    }
    return { ...base, ...data }
  }
  const supabase = await createServiceClient()
  const { data: updated, error } = await supabase
    .from('ai_runs')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return updated
}
```

- [ ] **Step 5: Add write functions to server/dal/opportunities.ts**

First add `ScoreRationale` to the existing import at the top of `server/dal/opportunities.ts`:

```typescript
import type { Opportunity, OpportunityStatus, OpportunityType, ScoreRationale } from '@/types'
```

Then append to the end of `server/dal/opportunities.ts`:

```typescript
export async function createOpportunities(
  orgId: string,
  profileId: string,
  opportunities: Array<{
    company_name: string
    company_url?: string | null
    company_description?: string | null
    opportunity_type: OpportunityType
    score: number
    score_rationale: ScoreRationale | null
    estimated_impact: string | null
  }>
): Promise<Opportunity[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockOpportunities.filter(o => o.organization_id === orgId)
  }
  if (opportunities.length === 0) return []
  const supabase = await createServiceClient()
  const rows = opportunities.map(o => ({
    organization_id: orgId,
    business_profile_id: profileId,
    company_name: o.company_name,
    company_url: o.company_url ?? null,
    company_description: o.company_description ?? null,
    opportunity_type: o.opportunity_type,
    score: o.score,
    score_rationale: o.score_rationale,
    estimated_impact: o.estimated_impact,
    status: 'new' as OpportunityStatus,
  }))
  const { data, error } = await supabase
    .from('opportunities')
    .insert(rows)
    .select()
  if (error) throw error
  return data ?? []
}

export async function updateOpportunityStatus(
  id: string,
  status: OpportunityStatus
): Promise<Opportunity> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const existing = mockOpportunities.find(o => o.id === id)
    if (!existing) throw new Error(`Opportunity ${id} not found`)
    return { ...existing, status, updated_at: new Date().toISOString() }
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('opportunities')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
```

- [ ] **Step 6: Run the DAL tests**

```bash
npm test -- __tests__/dal.test.ts
```

Expected: all 12 tests pass (6 original + 6 new).

- [ ] **Step 7: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add server/dal/ __tests__/dal.test.ts
git commit -m "feat: add DAL write functions for business profiles, AI runs, and opportunities"
```

---

## Task 2: shadcn Components + Intake Validation Schema

**Files:**
- Create: `features/intake/validations.ts`
- Create: `__tests__/intake-validation.test.ts`
- Modify: `components/ui/` (shadcn will generate input, textarea, label)

- [ ] **Step 1: Write the failing validation test**

Create `__tests__/intake-validation.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { intakeFormSchema } from '@/features/intake/validations'

describe('intakeFormSchema', () => {
  it('rejects empty name', () => {
    const result = intakeFormSchema.safeParse({ name: '', description: 'A description long enough' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path[0] === 'name')).toBe(true)
    }
  })

  it('rejects description under 20 characters', () => {
    const result = intakeFormSchema.safeParse({ name: 'My Business', description: 'Too short' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path[0] === 'description')).toBe(true)
    }
  })

  it('rejects invalid website URL', () => {
    const result = intakeFormSchema.safeParse({
      name: 'My Business',
      description: 'A description long enough to pass',
      website_url: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })

  it('accepts empty website_url', () => {
    const result = intakeFormSchema.safeParse({
      name: 'My Business',
      description: 'A description long enough to pass',
      website_url: '',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid input', () => {
    const result = intakeFormSchema.safeParse({
      name: 'Acme Corp',
      description: 'We build B2B SaaS tools for finance teams',
      website_url: 'https://acme.example.com',
    })
    expect(result.success).toBe(true)
  })
})
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npm test -- __tests__/intake-validation.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create features/intake/validations.ts**

```typescript
import { z } from 'zod'

export const intakeFormSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters'),
  website_url: z
    .string()
    .url('Must be a valid URL (e.g. https://example.com)')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters'),
})

export type IntakeFormInput = z.infer<typeof intakeFormSchema>
```

- [ ] **Step 4: Run to confirm tests pass**

```bash
npm test -- __tests__/intake-validation.test.ts
```

Expected: 5 passed.

- [ ] **Step 5: Install shadcn input, textarea, label**

```bash
npx shadcn@latest add input textarea label
```

Expected: files created at `components/ui/input.tsx`, `components/ui/textarea.tsx`, `components/ui/label.tsx`. No errors.

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add features/intake/validations.ts components/ui/ __tests__/intake-validation.test.ts
git commit -m "feat: add intake form validation schema and install shadcn input/textarea/label"
```

---

## Task 3: Intake Form Component

**Files:**
- Create: `features/intake/components/intake-form.tsx`

No separate test file — this component requires router mocking setup not currently in place. TypeScript check is the quality gate.

- [ ] **Step 1: Create features/intake/components/intake-form.tsx**

```typescript
'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { intakeFormSchema, type IntakeFormInput } from '../validations'
import { analyzeBusinessProfile } from '../server/actions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function IntakeForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IntakeFormInput>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: { name: '', website_url: '', description: '' },
  })

  function onSubmit(values: IntakeFormInput) {
    startTransition(async () => {
      await analyzeBusinessProfile(values)
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm text-[var(--text-secondary)]">
          Business name <span className="text-[var(--destructive)]">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Acme Corp"
          disabled={isPending}
          className={cn(
            'bg-[var(--surface-raised)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
            errors.name && 'border-[var(--destructive)]'
          )}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-xs text-[var(--destructive)]">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="website_url" className="text-sm text-[var(--text-secondary)]">
          Website URL <span className="text-[var(--text-muted)] font-normal">(optional)</span>
        </Label>
        <Input
          id="website_url"
          placeholder="https://acme.example.com"
          disabled={isPending}
          className={cn(
            'bg-[var(--surface-raised)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
            errors.website_url && 'border-[var(--destructive)]'
          )}
          {...register('website_url')}
        />
        {errors.website_url && (
          <p className="text-xs text-[var(--destructive)]">{errors.website_url.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-sm text-[var(--text-secondary)]">
          Business description <span className="text-[var(--destructive)]">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe what your business does, who you sell to, and what problem you solve..."
          rows={5}
          disabled={isPending}
          className={cn(
            'bg-[var(--surface-raised)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none',
            errors.description && 'border-[var(--destructive)]'
          )}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-xs text-[var(--destructive)]">{errors.description.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing...
          </span>
        ) : (
          'Analyze My Business'
        )}
      </Button>
    </form>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add features/intake/components/intake-form.tsx
git commit -m "feat: add intake form component with validation and loading state"
```

---

## Task 4: Intake Server Actions

**Files:**
- Create: `features/intake/server/actions.ts`
- Create: `__tests__/intake-actions.test.ts`

- [ ] **Step 1: Write the failing server action test**

Create `__tests__/intake-actions.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { vi } from 'vitest'

vi.stubEnv('NEXT_PUBLIC_USE_MOCK_DATA', 'true')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'placeholder')
vi.stubEnv('OPENAI_API_KEY', 'sk-placeholder')

describe('analyzeBusinessProfile — mock mode', () => {
  it('returns the mock business profile', async () => {
    const { analyzeBusinessProfile } = await import('@/features/intake/server/actions')
    const { MOCK_PROFILE_ID } = await import('@/lib/mock')
    const result = await analyzeBusinessProfile({
      name: 'Test Co',
      description: 'A description long enough to pass validation',
      website_url: '',
    })
    expect(result.id).toBe(MOCK_PROFILE_ID)
    expect(result.status).toBe('complete')
  })
})

describe('runDiscovery — mock mode', () => {
  it('returns mock opportunities', async () => {
    const { runDiscovery } = await import('@/features/intake/server/actions')
    const { MOCK_PROFILE_ID } = await import('@/lib/mock')
    const result = await runDiscovery(MOCK_PROFILE_ID)
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run to confirm it fails**

```bash
npm test -- __tests__/intake-actions.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create features/intake/server/actions.ts**

```typescript
'use server'

import { ai } from '@/lib/ai/providers'
import {
  systemPrompt as intakeSystemPrompt,
  outputSchema as intakeOutputSchema,
  formatInput as intakeFormatInput,
} from '@/lib/ai/prompts/intake-agent'
import {
  systemPrompt as discoverySystemPrompt,
  outputSchema as discoveryOutputSchema,
  formatInput as discoveryFormatInput,
} from '@/lib/ai/prompts/discovery-agent'
import {
  systemPrompt as scoringSystemPrompt,
  outputSchema as scoringOutputSchema,
  formatInput as scoringFormatInput,
} from '@/lib/ai/prompts/scoring-agent'
import {
  getBusinessProfileById,
  createBusinessProfile,
  updateBusinessProfile,
} from '@/server/dal/business-profiles'
import { createAIRun, updateAIRun } from '@/server/dal/ai-runs'
import { createOpportunities } from '@/server/dal/opportunities'
import { mockBusinessProfiles, mockOpportunities, MOCK_ORG_ID, MOCK_PROFILE_ID } from '@/lib/mock'
import type { BusinessProfile, Opportunity } from '@/types'
import type { IntakeFormInput } from '../validations'

// Auth is deferred — hardcoded org until auth is implemented
const ORG_ID = MOCK_ORG_ID

export async function analyzeBusinessProfile(
  input: IntakeFormInput
): Promise<BusinessProfile> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockBusinessProfiles.find(p => p.id === MOCK_PROFILE_ID)!
  }

  const profile = await createBusinessProfile(ORG_ID, {
    name: input.name,
    website_url: input.website_url || null,
    description: input.description,
    status: 'draft',
  })

  const run = await createAIRun(ORG_ID, 'intake', {
    name: input.name,
    website_url: input.website_url,
    description: input.description,
  })

  const start = Date.now()

  try {
    await updateAIRun(run.id, { status: 'running', started_at: new Date().toISOString() })

    const result = await ai.complete({
      messages: intakeFormatInput({
        name: input.name,
        websiteUrl: input.website_url || undefined,
        description: input.description,
      }),
      systemPrompt: intakeSystemPrompt,
      schema: intakeOutputSchema,
    })

    const updated = await updateBusinessProfile(profile.id, {
      icp: result.content.icp,
      positioning: result.content.positioning,
      growth_brief: result.content.growth_brief,
      status: 'complete',
    })

    await updateAIRun(run.id, {
      status: 'complete',
      output: result.content as unknown as Record<string, unknown>,
      tokens_used: result.tokensUsed,
      duration_ms: Date.now() - start,
      completed_at: new Date().toISOString(),
    })

    return updated
  } catch (error) {
    await updateAIRun(run.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - start,
      completed_at: new Date().toISOString(),
    })
    throw error
  }
}

export async function runDiscovery(profileId: string): Promise<Opportunity[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockOpportunities.filter(o => o.business_profile_id === MOCK_PROFILE_ID)
  }

  const profile = await getBusinessProfileById(profileId)
  if (!profile) throw new Error('Profile not found')

  const discoveryRun = await createAIRun(ORG_ID, 'discovery', { profileId })
  const discoveryStart = Date.now()

  try {
    await updateAIRun(discoveryRun.id, {
      status: 'running',
      started_at: new Date().toISOString(),
    })

    const discoveryResult = await ai.complete({
      messages: discoveryFormatInput(profile),
      systemPrompt: discoverySystemPrompt,
      schema: discoveryOutputSchema,
    })

    await updateAIRun(discoveryRun.id, {
      status: 'complete',
      output: discoveryResult.content as unknown as Record<string, unknown>,
      tokens_used: discoveryResult.tokensUsed,
      duration_ms: Date.now() - discoveryStart,
      completed_at: new Date().toISOString(),
    })

    const scoringRun = await createAIRun(ORG_ID, 'scoring', {
      profileId,
      opportunityCount: discoveryResult.content.opportunities.length,
    })
    const scoringStart = Date.now()
    let totalScoringTokens = 0

    await updateAIRun(scoringRun.id, {
      status: 'running',
      started_at: new Date().toISOString(),
    })

    const scoredOpportunities = await Promise.all(
      discoveryResult.content.opportunities.map(async (opp) => {
        const scoringResult = await ai.complete({
          messages: scoringFormatInput(profile, {
            company_name: opp.company_name,
            company_description: opp.rationale,
            opportunity_type: opp.opportunity_type,
          }),
          systemPrompt: scoringSystemPrompt,
          schema: scoringOutputSchema,
        })
        totalScoringTokens += scoringResult.tokensUsed
        return {
          company_name: opp.company_name,
          company_url: opp.company_url ?? null,
          company_description: opp.rationale,
          opportunity_type: opp.opportunity_type,
          score: scoringResult.content.score,
          score_rationale: scoringResult.content.score_rationale,
          estimated_impact: scoringResult.content.estimated_impact,
        }
      })
    )

    await updateAIRun(scoringRun.id, {
      status: 'complete',
      tokens_used: totalScoringTokens,
      duration_ms: Date.now() - scoringStart,
      completed_at: new Date().toISOString(),
    })

    return await createOpportunities(ORG_ID, profileId, scoredOpportunities)
  } catch (error) {
    await updateAIRun(discoveryRun.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - discoveryStart,
      completed_at: new Date().toISOString(),
    })
    throw error
  }
}
```

- [ ] **Step 4: Run the server action tests**

```bash
npm test -- __tests__/intake-actions.test.ts
```

Expected: 2 passed.

- [ ] **Step 5: Run the full test suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add features/intake/server/ __tests__/intake-actions.test.ts
git commit -m "feat: add intake and discovery server actions with mock mode short-circuit"
```

---

## Task 5: Analysis Display Component

**Files:**
- Create: `features/intake/components/analysis-display.tsx`

- [ ] **Step 1: Create features/intake/components/analysis-display.tsx**

```typescript
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { BusinessProfile } from '@/types'
import { runDiscovery } from '../server/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface AnalysisDisplayProps {
  profile: BusinessProfile
}

export function AnalysisDisplay({ profile }: AnalysisDisplayProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleRunDiscovery() {
    startTransition(async () => {
      await runDiscovery(profile.id)
      router.push('/opportunities')
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{profile.name}</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Analysis complete</p>
        </div>
        <Button
          onClick={handleRunDiscovery}
          disabled={isPending}
          className="shrink-0 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Discovering...
            </span>
          ) : (
            'Discover Opportunities'
          )}
        </Button>
      </div>

      {profile.icp && (
        <section className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
            Ideal Customer Profile
          </h3>
          <dl className="space-y-3 text-sm">
            {profile.icp.company_size && (
              <div className="flex gap-2">
                <dt className="text-[var(--text-muted)] w-28 shrink-0">Company size</dt>
                <dd className="text-[var(--text-primary)]">{profile.icp.company_size}</dd>
              </div>
            )}
            {profile.icp.industry && (
              <div className="flex gap-2">
                <dt className="text-[var(--text-muted)] w-28 shrink-0">Industry</dt>
                <dd className="text-[var(--text-primary)]">{profile.icp.industry}</dd>
              </div>
            )}
            {profile.icp.role && (
              <div className="flex gap-2">
                <dt className="text-[var(--text-muted)] w-28 shrink-0">Buyer role</dt>
                <dd className="text-[var(--text-primary)]">{profile.icp.role}</dd>
              </div>
            )}
            {profile.icp.budget_range && (
              <div className="flex gap-2">
                <dt className="text-[var(--text-muted)] w-28 shrink-0">Budget range</dt>
                <dd className="text-[var(--text-primary)]">{profile.icp.budget_range}</dd>
              </div>
            )}
            {profile.icp.pain_points && profile.icp.pain_points.length > 0 && (
              <div>
                <dt className="text-[var(--text-muted)] mb-2">Pain points</dt>
                <dd>
                  <ul className="space-y-1">
                    {profile.icp.pain_points.map((p, i) => (
                      <li key={i} className="flex gap-2 text-[var(--text-primary)]">
                        <span className="text-[var(--text-muted)] shrink-0">·</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {profile.positioning && (
        <section className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Positioning</h3>
          <div className="space-y-4 text-sm">
            {profile.positioning.value_proposition && (
              <div>
                <div className="text-[var(--text-muted)] mb-1">Value proposition</div>
                <p className="text-[var(--text-primary)]">{profile.positioning.value_proposition}</p>
              </div>
            )}
            {profile.positioning.differentiators && profile.positioning.differentiators.length > 0 && (
              <div>
                <div className="text-[var(--text-muted)] mb-2">Differentiators</div>
                <ul className="space-y-1">
                  {profile.positioning.differentiators.map((d, i) => (
                    <li key={i} className="flex gap-2 text-[var(--text-primary)]">
                      <span className="text-[var(--text-muted)] shrink-0">·</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {profile.positioning.competitors && profile.positioning.competitors.length > 0 && (
              <div>
                <div className="text-[var(--text-muted)] mb-2">Competitors</div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.positioning.competitors.map((c, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-xs border-[var(--border-color)] text-[var(--text-secondary)]"
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {profile.growth_brief && (
        <section className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Growth Brief</h3>
          <div className="space-y-4 text-sm">
            {profile.growth_brief.summary && (
              <p className="text-[var(--text-primary)]">{profile.growth_brief.summary}</p>
            )}
            {profile.growth_brief.partnership_categories &&
              profile.growth_brief.partnership_categories.length > 0 && (
                <div>
                  <div className="text-[var(--text-muted)] mb-2">Partnership categories</div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.growth_brief.partnership_categories.map((c, i) => (
                      <Badge
                        key={i}
                        className="text-xs bg-[var(--accent-subtle)] text-[var(--accent)] border-0 hover:bg-[var(--accent-subtle)]"
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            {profile.growth_brief.recommended_channels &&
              profile.growth_brief.recommended_channels.length > 0 && (
                <div>
                  <div className="text-[var(--text-muted)] mb-2">Recommended channels</div>
                  <ul className="space-y-1">
                    {profile.growth_brief.recommended_channels.map((c, i) => (
                      <li key={i} className="flex gap-2 text-[var(--text-primary)]">
                        <span className="text-[var(--text-muted)] shrink-0">·</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </section>
      )}
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add features/intake/components/analysis-display.tsx
git commit -m "feat: add analysis display component with ICP, positioning, and growth brief sections"
```

---

## Task 6: Wire Up Intake Page

**Files:**
- Modify: `app/(dashboard)/intake/page.tsx`

- [ ] **Step 1: Replace app/(dashboard)/intake/page.tsx**

```typescript
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/shared/skeleton'
import { getLatestBusinessProfile } from '@/server/dal/business-profiles'
import { MOCK_ORG_ID } from '@/lib/mock'
import { IntakeForm } from '@/features/intake/components/intake-form'
import { AnalysisDisplay } from '@/features/intake/components/analysis-display'

export default async function IntakePage() {
  const profile = await getLatestBusinessProfile(MOCK_ORG_ID)
  const hasCompleteProfile = profile?.status === 'complete'

  return (
    <>
      <PageHeader
        title="Business Intake"
        subtitle={
          hasCompleteProfile
            ? `Analysis for ${profile!.name}`
            : 'Submit your business for AI analysis'
        }
      />
      <div className="max-w-2xl">
        {!profile || profile.status === 'draft' ? (
          <IntakeForm />
        ) : profile.status === 'processing' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <svg className="animate-spin w-4 h-4 text-[var(--accent)]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing your business...
            </div>
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-36 w-full rounded-lg" />
          </div>
        ) : (
          <AnalysisDisplay profile={profile!} />
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Start the dev server and test the intake page**

```bash
npm run dev
```

Open `http://localhost:3000/intake`. Verify:
- [ ] Page loads without error
- [ ] Since mock data is on and the mock profile has `status: 'complete'`, the AnalysisDisplay renders
- [ ] Page header shows "Analysis for Acme AI — Sales Intelligence Platform"
- [ ] ICP section shows company size, industry, buyer role
- [ ] Positioning section shows value prop and competitors badges
- [ ] Growth Brief section shows partnership categories with accent badges
- [ ] "Discover Opportunities" button is present

Stop with `Ctrl+C`.

- [ ] **Step 4: Commit**

```bash
git add app/(dashboard)/intake/page.tsx
git commit -m "feat: wire up intake page to show form or analysis display based on profile status"
```

---

## Task 7: Opportunity Status Action + Opportunity Card

**Files:**
- Create: `features/opportunities/server/actions.ts`
- Create: `features/opportunities/components/opportunity-card.tsx`

- [ ] **Step 1: Create features/opportunities/server/actions.ts**

```typescript
'use server'

import { updateOpportunityStatus as dalUpdateStatus } from '@/server/dal/opportunities'
import type { Opportunity, OpportunityStatus } from '@/types'
import { revalidatePath } from 'next/cache'

export async function updateOpportunityStatus(
  id: string,
  status: OpportunityStatus
): Promise<Opportunity> {
  const updated = await dalUpdateStatus(id, status)
  revalidatePath('/opportunities')
  return updated
}
```

- [ ] **Step 2: Create features/opportunities/components/opportunity-card.tsx**

```typescript
'use client'

import { useTransition } from 'react'
import type { Opportunity, OpportunityStatus, OpportunityType } from '@/types'
import { updateOpportunityStatus } from '../server/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const TYPE_LABELS: Record<OpportunityType, string> = {
  integration: 'Integration',
  'co-marketing': 'Co-Marketing',
  reseller: 'Reseller',
  distribution: 'Distribution',
  technology: 'Technology',
  strategic: 'Strategic',
}

const STATUS_STYLES: Record<OpportunityStatus, string> = {
  new: 'bg-[var(--surface-raised)] text-[var(--text-secondary)]',
  reviewing: 'bg-blue-500/10 text-blue-400',
  approved: 'bg-green-500/10 text-green-400',
  rejected: 'bg-red-500/10 text-red-400',
  contacted: 'bg-purple-500/10 text-purple-400',
}

function ScoreBadge({ score }: { score: number }) {
  const colorClass =
    score >= 90
      ? 'bg-green-500/10 text-green-400 border-green-500/20'
      : score >= 70
      ? 'bg-lime-500/10 text-lime-400 border-lime-500/20'
      : score >= 50
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      : 'bg-red-500/10 text-red-400 border-red-500/20'
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold border shrink-0',
        colorClass
      )}
    >
      {score}
    </span>
  )
}

interface OpportunityCardProps {
  opportunity: Opportunity
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const [isPending, startTransition] = useTransition()
  const canAct =
    opportunity.status === 'new' || opportunity.status === 'reviewing'

  function handleStatusChange(status: OpportunityStatus) {
    startTransition(async () => {
      await updateOpportunityStatus(opportunity.id, status)
    })
  }

  return (
    <div
      className={cn(
        'rounded-lg border bg-[var(--surface)] p-4 flex flex-col gap-3 transition-opacity',
        opportunity.status === 'rejected'
          ? 'border-[var(--border-color)] opacity-50'
          : 'border-[var(--border-color)]',
        isPending && 'opacity-60 pointer-events-none'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-[var(--text-primary)] leading-tight">
              {opportunity.company_name}
            </span>
            <Badge
              variant="outline"
              className="text-xs shrink-0 border-[var(--border-color)] text-[var(--text-muted)]"
            >
              {TYPE_LABELS[opportunity.opportunity_type]}
            </Badge>
          </div>
          {opportunity.company_url && (
            <a
              href={opportunity.company_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] truncate block mt-0.5"
            >
              {opportunity.company_url.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
        <ScoreBadge score={opportunity.score} />
      </div>

      {opportunity.company_description && (
        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
          {opportunity.company_description}
        </p>
      )}

      {opportunity.estimated_impact && (
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          <span className="text-[var(--text-secondary)] font-medium">Impact: </span>
          {opportunity.estimated_impact}
        </p>
      )}

      <div className="flex items-center justify-between pt-1 mt-auto">
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize',
            STATUS_STYLES[opportunity.status]
          )}
        >
          {opportunity.status}
        </span>
        {canAct && (
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => handleStatusChange('approved')}
              className="text-xs h-7 px-2.5 border-[var(--border-color)] hover:border-green-500/50 hover:text-green-400 hover:bg-green-500/5"
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => handleStatusChange('rejected')}
              className="text-xs h-7 px-2.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/5"
            >
              Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add features/opportunities/
git commit -m "feat: add opportunity card with score badge and approve/reject actions"
```

---

## Task 8: Filter Bar + Wire Up Opportunities Page

**Files:**
- Create: `features/opportunities/components/filter-bar.tsx`
- Modify: `app/(dashboard)/opportunities/page.tsx`

- [ ] **Step 1: Create features/opportunities/components/filter-bar.tsx**

```typescript
'use client'

import { useRouter, usePathname } from 'next/navigation'
import type { OpportunityStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_TABS: { label: string; value: OpportunityStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Reviewing', value: 'reviewing' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

const SCORE_OPTIONS: { label: string; value: string }[] = [
  { label: 'All scores', value: '' },
  { label: '≥70', value: '70' },
  { label: '≥80', value: '80' },
  { label: '≥90', value: '90' },
]

interface FilterBarProps {
  currentStatus: OpportunityStatus | 'all'
  currentMinScore: string
  total: number
}

export function FilterBar({ currentStatus, currentMinScore, total }: FilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()

  function buildUrl(status: OpportunityStatus | 'all', minScore: string): string {
    const params = new URLSearchParams()
    if (status !== 'all') params.set('status', status)
    if (minScore) params.set('minScore', minScore)
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  return (
    <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
      <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--surface-raised)]">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => router.push(buildUrl(tab.value, currentMinScore))}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              currentStatus === tab.value
                ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <select
          value={currentMinScore}
          onChange={(e) => router.push(buildUrl(currentStatus, e.target.value))}
          className="text-sm bg-[var(--surface-raised)] border border-[var(--border-color)] rounded-md px-2 py-1.5 text-[var(--text-secondary)] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          {SCORE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="text-sm text-[var(--text-muted)] whitespace-nowrap">
          {total} result{total !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Replace app/(dashboard)/opportunities/page.tsx**

```typescript
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { getOpportunities } from '@/server/dal/opportunities'
import { MOCK_ORG_ID } from '@/lib/mock'
import { FilterBar } from '@/features/opportunities/components/filter-bar'
import { OpportunityCard } from '@/features/opportunities/components/opportunity-card'
import type { OpportunityStatus } from '@/types'

interface PageProps {
  searchParams: Promise<{ status?: string; minScore?: string }>
}

export default async function OpportunitiesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const status = params.status as OpportunityStatus | undefined
  const minScore = params.minScore ? parseInt(params.minScore, 10) : undefined
  const currentStatus = (params.status as OpportunityStatus | 'all') || 'all'
  const currentMinScore = params.minScore ?? ''

  const opportunities = await getOpportunities(MOCK_ORG_ID, { status, minScore })

  return (
    <>
      <PageHeader
        title="Opportunities"
        subtitle="AI-discovered partnership opportunities"
      />
      <FilterBar
        currentStatus={currentStatus}
        currentMinScore={currentMinScore}
        total={opportunities.length}
      />
      {opportunities.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-6a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
              />
            </svg>
          }
          title="No opportunities found"
          description="Try adjusting your filters, or run Discovery from the Intake page."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Start the dev server and test both pages**

```bash
npm run dev
```

Test the Intake page at `http://localhost:3000/intake`:
- [ ] Analysis display renders with mock data
- [ ] "Discover Opportunities" button is visible
- [ ] Click "Discover Opportunities" — spinner shows, then navigates to /opportunities

Test the Opportunities page at `http://localhost:3000/opportunities`:
- [ ] 8 opportunity cards render in a 3-column grid
- [ ] Each card shows company name, type badge, score circle, description, estimated impact
- [ ] Score circles are color-coded: ≥90 green (Salesforce=91), ≥70 lime (HubSpot=88, Outreach=85), etc.
- [ ] Drift (score 58) card shows as amber/red
- [ ] "Approve" and "Reject" buttons appear on cards with status "new" or "reviewing"
- [ ] Rejected card (Drift) shows reduced opacity
- [ ] Status tabs at top: All / New / Reviewing / Approved / Rejected
- [ ] Clicking "Approved" tab → URL becomes `/opportunities?status=approved`, page shows only Salesforce and G2 cards
- [ ] Clicking "≥80" score filter → URL adds `minScore=80`, only high-score cards show
- [ ] Clicking "Approve" on a "new" opportunity shows a loading state (button grays out) while the action runs; after the re-render the status badge reverts to its original value because mock data is in-memory and immutable — the action completes without error but the mock array is unchanged. This is expected in mock mode.
- [ ] No console errors

Stop with `Ctrl+C`.

- [ ] **Step 5: Commit**

```bash
git add features/opportunities/components/filter-bar.tsx app/(dashboard)/opportunities/page.tsx
git commit -m "feat: add filter bar and wire up opportunities page with server-side filtering"
```

---

## Task 9: Final Verification

- [ ] **Step 1: Run the full test suite**

```bash
npm test
```

Expected: all tests pass. No failures. Check output shows test count ≥ 18 (original 12 + 6 DAL write + 5 validation + 2 server actions).

- [ ] **Step 2: TypeScript strict check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Production build**

```bash
npm run build
```

Expected: build completes successfully. Routes listed include `/intake` and `/opportunities` (likely `ƒ` dynamic, not `○` static, because they read searchParams/DAL).

- [ ] **Step 4: Verify build output routes**

In the build output, confirm these routes appear:
```
ƒ /intake
ƒ /opportunities
```

If they appear as `○` (static), that is also fine — Next.js may prerender them.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: Phase 2 complete — intake flow and opportunities board"
```

---

## Phase 2 Complete

| Feature | Status |
|---|---|
| Intake form (React Hook Form + Zod) | ✅ |
| `analyzeBusinessProfile` Server Action (mock + real) | ✅ |
| Analysis display (ICP, positioning, growth brief) | ✅ |
| `runDiscovery` Server Action (discovery + scoring chain) | ✅ |
| Intake page wired (Server Component, shows form or result) | ✅ |
| Opportunity card (score badge, type, status, approve/reject) | ✅ |
| Filter bar (status tabs + score filter, URL-driven) | ✅ |
| Opportunities page wired (Server Component + searchParams) | ✅ |
| DAL write functions (create/update for profiles, runs, opps) | ✅ |
| All tests passing | ✅ |

**Next phase:** Phase 3 will implement the Outreach flow (draft generation, approval queue, and send tracking).
