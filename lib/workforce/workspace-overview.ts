import type {
  ActivityEvent,
  AIAgent,
  AIRun,
  Approval,
  ConnectorAccount,
  Report,
  WorkflowDefinition,
} from '@/types'
import { parseRuntimeEnv, resolveDataSource, type AppEnv, type DataSource } from '@/lib/env/runtime'
import { getAIAgents } from '@/server/dal/ai-agents'
import { getActiveAIRuns } from '@/server/dal/ai-runs'
import { getActivityEvents } from '@/server/dal/activity-events'
import { getApprovals } from '@/server/dal/approvals'
import { getConnectorAccounts } from '@/server/dal/connectors'
import { getReports } from '@/server/dal/reports'
import { getWorkflows } from '@/server/dal/workflows'

const WORKSPACE_PREVIEW_LIMITS = {
  approvals: 5,
  workflows: 5,
  reports: 3,
  activity: 6,
}

export interface ConnectorHealthSummary {
  connected: number
  attention: number
  error: number
  notConnected: number
  total: number
}

export interface WorkspaceOverview {
  dataSource: DataSource
  appEnv: AppEnv
  counts: {
    visibleAgents: number
    deployedAgents: number
    activeRuns: number
    pendingApprovals: number
    workflows: number
  }
  agents: AIAgent[]
  activeRuns: AIRun[]
  approvals: Approval[]
  workflows: WorkflowDefinition[]
  reports: Report[]
  activity: ActivityEvent[]
  connectorAccounts: ConnectorAccount[]
  connectorHealth: ConnectorHealthSummary
  errors: Partial<Record<'agents' | 'runs' | 'approvals' | 'workflows' | 'reports' | 'activity' | 'connectors', string>>
}

export interface WorkspaceOverviewInput {
  appEnv: AppEnv
  agents: AIAgent[]
  activeRuns: AIRun[]
  approvals: Approval[]
  workflows: WorkflowDefinition[]
  reports: Report[]
  activity: ActivityEvent[]
  connectorAccounts: ConnectorAccount[]
  dataSource?: DataSource
  errors?: WorkspaceOverview['errors']
}

export interface WorkspaceOverviewService {
  getOverview(orgId: string): Promise<WorkspaceOverview>
}

export function buildWorkspaceOverview(input: WorkspaceOverviewInput): WorkspaceOverview {
  const deployedAgents = input.agents.filter(agent => agent.deployed)
  const visibleAgents = input.appEnv === 'production' ? deployedAgents : input.agents

  return {
    dataSource: input.dataSource ?? 'live',
    appEnv: input.appEnv,
    counts: {
      visibleAgents: visibleAgents.length,
      deployedAgents: deployedAgents.length,
      activeRuns: input.activeRuns.length,
      pendingApprovals: input.approvals.length,
      workflows: input.workflows.length,
    },
    agents: visibleAgents,
    activeRuns: input.activeRuns,
    approvals: input.approvals.slice(0, WORKSPACE_PREVIEW_LIMITS.approvals),
    workflows: input.workflows.slice(0, WORKSPACE_PREVIEW_LIMITS.workflows),
    reports: input.reports.slice(0, WORKSPACE_PREVIEW_LIMITS.reports),
    activity: input.activity.slice(0, WORKSPACE_PREVIEW_LIMITS.activity),
    connectorAccounts: input.connectorAccounts,
    connectorHealth: summarizeConnectorHealth(input.connectorAccounts),
    errors: input.errors ?? {},
  }
}

export function createWorkspaceOverviewService(): WorkspaceOverviewService {
  const runtime = parseRuntimeEnv(process.env)
  const dataSource = resolveDataSource(runtime)

  return {
    async getOverview(orgId: string) {
      const [
        agents,
        activeRuns,
        approvals,
        workflows,
        reports,
        activity,
        connectorAccounts,
      ] = await Promise.all([
        capture('agents', () => getAIAgents(orgId)),
        capture('runs', () => getActiveAIRuns(orgId)),
        capture('approvals', () => getApprovals(orgId, { status: 'pending' })),
        capture('workflows', () => getWorkflows(orgId)),
        capture('reports', () => getReports(orgId, WORKSPACE_PREVIEW_LIMITS.reports)),
        capture('activity', () => getActivityEvents(orgId, WORKSPACE_PREVIEW_LIMITS.activity)),
        capture('connectors', () => getConnectorAccounts(orgId)),
      ])

      return buildWorkspaceOverview({
        appEnv: runtime.appEnv,
        dataSource,
        agents: agents.data,
        activeRuns: activeRuns.data,
        approvals: approvals.data,
        workflows: workflows.data,
        reports: reports.data,
        activity: activity.data,
        connectorAccounts: connectorAccounts.data,
        errors: {
          ...agents.error,
          ...activeRuns.error,
          ...approvals.error,
          ...workflows.error,
          ...reports.error,
          ...activity.error,
          ...connectorAccounts.error,
        },
      })
    },
  }
}

function summarizeConnectorHealth(accounts: ConnectorAccount[]): ConnectorHealthSummary {
  return accounts.reduce<ConnectorHealthSummary>(
    (summary, account) => {
      summary.total += 1
      if (account.status === 'connected') summary.connected += 1
      if (account.status === 'attention') summary.attention += 1
      if (account.status === 'error') summary.error += 1
      if (account.status === 'not_connected') summary.notConnected += 1
      return summary
    },
    { connected: 0, attention: 0, error: 0, notConnected: 0, total: 0 },
  )
}

async function capture<T>(
  key: keyof WorkspaceOverview['errors'],
  load: () => Promise<T[]>,
): Promise<{ data: T[]; error: WorkspaceOverview['errors'] }> {
  try {
    return { data: await load(), error: {} }
  } catch (error) {
    return {
      data: [],
      error: {
        [key]: error instanceof Error ? error.message : 'Unable to load this panel.',
      },
    }
  }
}
