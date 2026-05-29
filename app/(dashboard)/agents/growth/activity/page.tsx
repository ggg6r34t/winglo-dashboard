import { OrchestrationPageClient } from '@/features/orchestration/components/orchestration-page-client'
import { getAIRuns, getOrgAgentLogs } from '@/server/dal/ai-runs'
import { getOrganizationById } from '@/server/dal/organizations'
import { getCurrentOrgId } from '@/server/auth/org'

export default async function GrowthActivityPage() {
  const orgId = await getCurrentOrgId()
  const [initialRuns, initialLogs, org] = await Promise.all([
    getAIRuns(orgId, { limit: 20 }),
    getOrgAgentLogs(orgId, 100),
    getOrganizationById(orgId),
  ])

  return (
    <div className="hub-body fade-in">
      <OrchestrationPageClient
        initialRuns={initialRuns}
        initialLogs={initialLogs}
        monitoringEnabled={org?.monitoring_enabled ?? false}
      />
    </div>
  )
}
