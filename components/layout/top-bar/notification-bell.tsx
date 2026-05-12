'use client'

import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const mockNotifications = [
  { id: '1', text: 'Salesforce outreach approved', time: '2m ago' },
  { id: '2', text: 'Discovery agent found 3 new opportunities', time: '1h ago' },
  { id: '3', text: 'G2 email sent successfully', time: '3h ago' },
]

export function NotificationBell() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 bg-[var(--surface-raised)] border-[var(--border-color)]"
      >
        {mockNotifications.map(n => (
          <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2.5 cursor-pointer">
            <span className="text-sm text-[var(--text-primary)]">{n.text}</span>
            <span className="text-xs text-[var(--text-muted)]">{n.time}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
