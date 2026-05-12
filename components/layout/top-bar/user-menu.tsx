'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const MOCK_USER = { name: 'Alex Kim', email: 'alex@acme-ai.example.com' }

export function UserMenu() {
  const initials = MOCK_USER.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]">
          <Avatar className="w-7 h-7">
            <AvatarFallback className="bg-[var(--surface-raised)] text-[var(--text-secondary)] text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52 bg-[var(--surface-raised)] border-[var(--border-color)]"
      >
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-[var(--text-primary)]">{MOCK_USER.name}</p>
          <p className="text-xs text-[var(--text-muted)] truncate">{MOCK_USER.email}</p>
        </div>
        <DropdownMenuSeparator className="bg-[var(--border-color)]" />
        <DropdownMenuItem className="text-sm cursor-pointer">Settings</DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[var(--border-color)]" />
        <DropdownMenuItem className="text-sm text-[var(--text-muted)] cursor-pointer">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
