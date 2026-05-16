# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Next.js Version

**Read `node_modules/next/dist/docs/` before writing any Next.js code.** This is Next.js 16.2.6 with React 19 — APIs, conventions, and file structure differ from training data. Heed deprecation notices.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm test             # Run all tests (vitest)
npm run test:watch   # Watch mode

# Run a single test file
npx vitest run __tests__/agent-registry.test.ts
```

## Local Development Without Credentials

Set `NEXT_PUBLIC_USE_MOCK_DATA=true` in `.env.local`. This bypasses all Supabase and AI calls — the DAL and pipeline code fall back to fixtures in `lib/mock/fixtures/`. All required env vars become optional in mock mode.

## Architecture

### Two Separate Type Systems — Never Conflate

**`AgentSlug`** (`lib/agents/registry.ts`) — the 9 UI-facing "AI employees" shown in the sidebar and agent hub pages: `growth | social-media | seo | marketing | telehealth | sales | research | outreach | analytics-manager`

**`AgentType`** (`types/database.ts`) — the 7 internal pipeline execution stages that `AIRun` rows reference: `intake | discovery | research | scoring | outreach | memory | analytics`

These are completely independent. `analytics-manager` (AgentSlug) ≠ `analytics` (AgentType). Only the `growth` agent (AgentSlug) has `deployed: true`; its backend pipeline runs as a sequence of `AgentType` stages.

### Data Flow

```
Supabase DB ←→ server/dal/*.ts (server-only)
                     ↓
         app/**/page.tsx (async server components)
                     ↓ props
         features/**/components/*.tsx (client or server)
```

DAL functions (`server/dal/`) use `createServiceClient()` (service role, server-only) and transparently fall back to `lib/mock/fixtures/` when `NEXT_PUBLIC_USE_MOCK_DATA=true`.

### Realtime Orchestration

`features/orchestration/hooks/use-orchestration-store.ts` — Zustand store that holds `recentRuns`, `agentStates`, and `feedEvents`. Server pages hydrate it via `hydrateRuns`/`hydrateLogs`; `use-realtime-runs.ts` subscribes to Supabase Realtime for live updates (no-op in mock mode). `agentStates` is a `Record<AgentType, AgentNodeState>` derived from the most recent run per agent type.

### AI Pipeline

`lib/ai/pipeline/discovery.ts` orchestrates the multi-stage Growth Agent run: `discovery → research → scoring`. Each stage creates an `AIRun` row, calls the AI provider, writes results to the DB, and writes `AgentLog` rows. The pipeline is triggered by the cron route at `app/api/cron/discovery/route.ts` (authenticated via `CRON_SECRET`).

### Route Structure

```
app/(dashboard)/
  layout.tsx                    ← ShellLayout wrapper
  workspace/page.tsx            ← Workforce overview (async server)
  workspace/live/page.tsx       ← Live orchestration (uses OrchestrationPageClient)
  agents/page.tsx               ← All-agents roster (server)
  agents/growth/layout.tsx      ← AgentHubLayout with 8 tabs
  agents/growth/[tab]/page.tsx  ← Growth hub tabs (intake, workflows, activity, reports, memory, analytics, settings)
  agents/[slug]/layout.tsx      ← Placeholder hubs (tabs=[], deployed:false)
  agents/[slug]/page.tsx        ← NotDeployedView for undeployed agents
```

Permanent redirects in `next.config.ts` forward old routes (`/dashboard`, `/orchestration`, etc.) to new locations.

### CSS Convention

The project uses Tailwind CSS v4 with custom CSS variables. **Always use the `var()` form** — `text-[var(--text-muted)]`, `bg-[var(--surface)]`, `border-[var(--border-color)]` — not the shorthand `text-text-muted`. The IDE may suggest shorthand (suggestCanonicalClasses warnings) — ignore it. Token definitions are in `app/globals.css`.

### Component Boundaries

- `AgentHubLayout` (`components/agents/agent-hub-layout.tsx`) — `'use client'`, reads orchestration store internally to derive `AgentStatus`. Server layouts import it as a leaf — no `'use client'` on layout files.
- `ShellLayout` + sidebar + topbar — all client components (use Framer Motion, Zustand, `usePathname`).
- All DAL functions and server actions are server-only (`import 'server-only'` or used only in async server components/route handlers).

### Feature Modules

Each feature in `features/` follows: `components/` (UI), `server/` (server actions with `'use server'`), and optional `hooks/` or `types/`. Server actions call DAL functions; client components call server actions via React `useTransition` or form actions.

### Mock Data

`lib/mock/index.ts` re-exports all fixtures. `MOCK_ORG_ID` and `MOCK_PROFILE_ID` are used consistently as the hardcoded org/profile IDs throughout the UI while `NEXT_PUBLIC_USE_MOCK_DATA=true`.
