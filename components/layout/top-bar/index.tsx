import { Separator } from '@/components/ui/separator'
import { OrgSwitcher } from './org-switcher'
import { NotificationBell } from './notification-bell'
import { UserMenu } from './user-menu'

export function TopBar({ agentStatusSlot }: { agentStatusSlot?: React.ReactNode }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center h-[52px] px-4 bg-[var(--surface)] border-b border-[var(--border-color)]">
      {/* Left */}
      <div className="flex items-center gap-2">
        <OrgSwitcher />
        <Separator orientation="vertical" className="h-4 bg-[var(--border-color)]" />
      </div>

      {/* Center */}
      <div className="flex-1 flex items-center justify-center">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--border-color)] bg-[var(--surface-raised)] text-sm text-[var(--text-muted)] hover:border-[var(--border-strong)] transition-colors w-64">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Search...</span>
          <span className="ml-auto text-xs border border-[var(--border-color)] rounded px-1 py-0.5">⌘K</span>
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {agentStatusSlot}
        <Separator orientation="vertical" className="h-4 bg-[var(--border-color)] mx-1" />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  )
}
