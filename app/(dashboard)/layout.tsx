import { ShellLayout } from '@/components/layout/shell-layout'
import { AgentStatusIndicator } from '@/components/layout/top-bar/agent-status-indicator'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ShellLayout agentStatusSlot={<AgentStatusIndicator />}>
      {children}
    </ShellLayout>
  )
}
