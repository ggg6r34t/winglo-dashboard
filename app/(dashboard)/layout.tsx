import { ShellLayout } from '@/components/layout/shell-layout'
import { ActiveAgentsPill } from '@/components/layout/top-bar/active-agents-pill'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ShellLayout agentStatusSlot={<ActiveAgentsPill />}>
      {children}
    </ShellLayout>
  )
}
