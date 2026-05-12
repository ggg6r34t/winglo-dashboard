import { NextResponse } from 'next/server'
import { getMonitoringEnabledOrgs } from '@/server/dal/organizations'
import { getLatestBusinessProfile } from '@/server/dal/business-profiles'
import { runDiscoveryPipeline } from '@/lib/ai/pipeline/discovery'

export async function GET(request: Request) {
  // Verify cron secret — Vercel injects Authorization: Bearer <CRON_SECRET>
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // No-op in mock mode — cron is a production-only concern
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return NextResponse.json({ skipped: true, reason: 'mock mode' })
  }

  const orgs = await getMonitoringEnabledOrgs()
  if (orgs.length === 0) {
    return NextResponse.json({ ran: 0 })
  }

  const results: Array<{ orgId: string; profileId: string; status: 'ok' | 'skipped' | 'error'; error?: string }> = []

  for (const org of orgs) {
    const profile = await getLatestBusinessProfile(org.id)
    if (!profile || profile.status !== 'complete') {
      results.push({ orgId: org.id, profileId: '', status: 'skipped' })
      continue
    }
    try {
      await runDiscoveryPipeline(org.id, profile.id)
      results.push({ orgId: org.id, profileId: profile.id, status: 'ok' })
    } catch (err) {
      results.push({
        orgId: org.id,
        profileId: profile.id,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({ ran: results.filter(r => r.status === 'ok').length, results })
}
