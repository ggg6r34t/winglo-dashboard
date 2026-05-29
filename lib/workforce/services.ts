import type {
  ActivityEvent,
  AIAgent,
  Approval,
  ApprovalStatus,
  Connector,
  ConnectorAccount,
  MemoryEntry,
  Report,
  WorkflowDefinition,
} from '@/types'
import { resolveDataSource, type DataSource } from '@/lib/env/runtime'
import { getAIAgents } from '@/server/dal/ai-agents'
import { getActivityEvents } from '@/server/dal/activity-events'
import { getApprovals } from '@/server/dal/approvals'
import { getConnectorAccounts, getConnectors } from '@/server/dal/connectors'
import { getMemoryEntries } from '@/server/dal/memory-entries'
import { getReports } from '@/server/dal/reports'
import { getWorkflows } from '@/server/dal/workflows'

export interface AgentService {
  listAgents(orgId: string): Promise<AIAgent[]>
}

export interface ActivityService {
  listActivity(orgId: string, limit?: number): Promise<ActivityEvent[]>
}

export interface ApprovalService {
  listApprovals(orgId: string, options?: { status?: ApprovalStatus; limit?: number }): Promise<Approval[]>
}

export interface ReportService {
  listReports(orgId: string, limit?: number): Promise<Report[]>
}

export interface ConnectorService {
  listConnectors(): Promise<Connector[]>
  listConnectorAccounts(orgId: string): Promise<ConnectorAccount[]>
}

export interface MemoryService {
  listMemory(orgId: string, options?: { limit?: number }): Promise<MemoryEntry[]>
}

export interface WorkflowService {
  listWorkflows(orgId: string, options?: { agentSlug?: string; limit?: number }): Promise<WorkflowDefinition[]>
}

export interface WorkforceServices {
  dataSource: DataSource
  agents: AgentService
  activity: ActivityService
  approvals: ApprovalService
  reports: ReportService
  connectors: ConnectorService
  memory: MemoryService
  workflows: WorkflowService
}

export function createWorkforceServices(): WorkforceServices {
  return {
    dataSource: resolveDataSource(),
    agents: { listAgents: getAIAgents },
    activity: { listActivity: getActivityEvents },
    approvals: { listApprovals: getApprovals },
    reports: { listReports: getReports },
    connectors: {
      listConnectors: getConnectors,
      listConnectorAccounts: getConnectorAccounts,
    },
    memory: { listMemory: getMemoryEntries },
    workflows: { listWorkflows: getWorkflows },
  }
}
