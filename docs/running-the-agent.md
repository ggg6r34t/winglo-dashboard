# Running the Agent

## Quick start — mock mode (zero setup)

Set one environment variable and everything works immediately with fixture data. No Supabase project, no API keys, no database.

```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_DATA=true
```

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). All seven agents, the orchestration graph, the pipeline, the activity feed, and every dashboard page work against fixture data.

---

## Full setup — real APIs

### 1. Supabase project

Create a project at [supabase.com](https://supabase.com). Then run the four migrations in order from the Supabase SQL editor or CLI:

```
supabase/migrations/0001_initial_schema.sql   — tables + pgvector extension
supabase/migrations/0002_rls_helpers.sql      — RLS helper function for org context
supabase/migrations/0003_vector_search.sql    — search_memories_by_similarity RPC
supabase/migrations/0004_monitoring.sql       — monitoring_enabled flag on organizations
```

pgvector is enabled by the first migration (`CREATE EXTENSION IF NOT EXISTS vector`). No manual dashboard step is needed.

### 2. AI provider

Choose one:

- **OpenAI** (default) — needs `OPENAI_API_KEY`. Used for all LLM calls and for `text-embedding-3-small` embeddings stored in memory.
- **Anthropic** — set `AI_PROVIDER=anthropic` and provide `ANTHROPIC_API_KEY`. Support is wired in `lib/ai/providers/anthropic.ts`.

### 3. `.env.local`

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI — OpenAI is the default provider
OPENAI_API_KEY=sk-...

# Optional — set to 'anthropic' to use Claude instead of OpenAI
# AI_PROVIDER=openai

# Cron — authenticates the /api/cron/discovery endpoint
CRON_SECRET=your-secret-here

# Mode — set to true to skip all external APIs and use fixture data
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### 4. Run

```bash
npm install
npm run dev      # development server at localhost:3000
npm run build    # production build (verifies types + pages compile)
npm run test     # run the test suite
```

---

## Continuous monitoring (Hetzner VPS)

The monitoring toggle on the Orchestration page enables autonomous discovery runs — the discovery → research → scoring pipeline fires on a schedule without any manual trigger.

The trigger endpoint is `GET /api/cron/discovery`. It is protected by the `Authorization: Bearer <CRON_SECRET>` header. It reads all organizations with `monitoring_enabled = true`, finds each org's latest complete business profile, and runs the full pipeline.

### Deploying to a Hetzner VPS

```bash
# On the VPS
git clone <repo> winglo && cd winglo
cp .env.local.example .env.local   # fill in all values
npm install
npm run build
```

Run the app as a persistent process with PM2:

```bash
npm install -g pm2
pm2 start npm --name "winglo" -- start
pm2 save
pm2 startup   # follow the printed command to register PM2 on boot
```

### Scheduling discovery runs with cron

Add a system cron job to call the endpoint on a schedule. Open the crontab:

```bash
crontab -e
```

Add a line — this example runs discovery every 6 hours:

```cron
0 */6 * * * curl -s -o /dev/null -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/discovery
```

Replace `YOUR_CRON_SECRET` with the value from `.env.local`. To run more frequently — e.g. every 2 hours — change `*/6` to `*/2`. To run once daily at 8 AM UTC: `0 8 * * *`.

The endpoint returns a JSON summary (`{ ran: N, results: [...] }`) you can log for debugging:

```cron
0 */6 * * * curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/discovery >> /var/log/winglo-cron.log 2>&1
```

---

## Environment variable reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Real mode only | — | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Real mode only | — | Supabase anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Real mode only | — | Supabase service role key (server only) |
| `OPENAI_API_KEY` | Real mode only | — | OpenAI API key for LLM calls and embeddings |
| `AI_PROVIDER` | No | `openai` | Set to `anthropic` to switch LLM provider |
| `CRON_SECRET` | Real mode only | — | Shared secret for authenticating `/api/cron/discovery` |
| `NEXT_PUBLIC_USE_MOCK_DATA` | No | `false` | Set to `true` for fixture-based local dev |

In mock mode, all Supabase and OpenAI credentials are replaced with placeholders automatically — the app will start without them. The cron endpoint skips all work in mock mode and returns `{ skipped: true }`.

---

## Readiness summary

| Context | Ready? | Notes |
|---|---|---|
| Local dev / demo | ✅ Yes | Mock mode, zero setup |
| Single-user staging | ✅ Yes | Needs env vars above |
| Single-user VPS (Hetzner) | ✅ Yes | PM2 + system cron, see above |
| Multi-user production | ❌ No | Auth required — `MOCK_ORG_ID` is hardcoded |

**Next gate before production:** wire Supabase Auth, replace `MOCK_ORG_ID` with `session.user.org_id`, and switch the DAL to `createOrgScopedClient()`. The RLS helper (`set_org_context`) and the org-scoped DAL functions are already written — auth is the only missing piece.

**Rate limiter note:** the current rate limiter is in-memory and per-process. It works correctly for single-instance deployments. For multi-instance deployments, replace the in-memory store in `lib/rate-limit.ts` with a Redis-backed implementation.
