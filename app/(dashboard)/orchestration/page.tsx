import { PageHeader } from '@/components/shared/page-header'
import { OrchestrationPageClient } from '@/features/orchestration/components/orchestration-page-client'
import { getAIRuns, getOrgAgentLogs } from '@/server/dal/ai-runs'
import { getOrganizationById } from '@/server/dal/organizations'
import { MOCK_ORG_ID } from '@/lib/mock'

export default async function OrchestrationPage() {
  const [initialRuns, initialLogs, org] = await Promise.all([
    getAIRuns(MOCK_ORG_ID, { limit: 20 }),
    getOrgAgentLogs(MOCK_ORG_ID, 100),
    getOrganizationById(MOCK_ORG_ID),
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
