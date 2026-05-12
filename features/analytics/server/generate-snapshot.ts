'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { MOCK_ORG_ID } from '@/lib/mock'
import { revalidatePath } from 'next/cache'

const ORG_ID = MOCK_ORG_ID

export async function generateDailySnapshot(): Promise<void> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') return

  const today = new Date().toISOString().split('T')[0]
  const supabase = await createServiceClient()

  const [oppsResult, outreachResult] = await Promise.all([
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
  ])

  const opportunities = oppsResult.data ?? []
  const outreach = outreachResult.data ?? []

  const outreach_sent = outreach.filter(d => d.status === 'sent').length
  const outreach_approved = outreach.filter(d => ['approved', 'sent'].includes(d.status)).length
  const opportunities_discovered = opportunities.length
  const opportunities_approved = opportunities.filter(o => o.status === 'approved').length
  const scores = opportunities.map(o => o.score).filter((s): s is number => s != null)
  const avg_score = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

  // response_rate is all-time (not today-scoped) — a rolling rate smooths daily noise
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

  const { error } = await supabase
    .from('analytics_snapshots')
    .upsert(
      { organization_id: ORG_ID, snapshot_date: today, metrics },
      { onConflict: 'organization_id,snapshot_date' }
    )
  if (error) throw error

  revalidatePath('/analytics')
}
