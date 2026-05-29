import { PageHeader } from '@/components/shared/page-header'
import { OrchestrationPageClient } from '@/features/orchestration/components/orchestration-page-client'
import { getAIRuns, getOrgAgentLogs } from '@/server/dal/ai-runs'
import { getOrganizationById } from '@/server/dal/organizations'
import { getCurrentOrgId } from '@/server/auth/org'

export default async function OrchestrationPage() {
  const orgId = await getCurrentOrgId()
  const [initialRuns, initialLogs, org] = await Promise.all([
    getAIRuns(orgId, { limit: 20 }),
    getOrgAgentLogs(orgId, 100),
    getOrganizationById(orgId),
  ])

  return (
    <>
      <PageHeader
        title="Orchestration"
        subtitle="Live AI agent workflow observability"
      />
      <OrchestrationPageClient
        initialRuns={initialRuns}
        initialLogs={initialLogs}
        monitoringEnabled={org?.monitoring_enabled ?? false}
      />
    </>
  )
}
