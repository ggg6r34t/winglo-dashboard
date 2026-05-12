'use client'

import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { mockOrganizations, MOCK_ORG_ID } from '@/lib/mock'

export function OrgSwitcher() {
  const currentOrg = mockOrganizations.find(o => o.id === MOCK_ORG_ID)!

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-raised)] transition-colors">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-[var(--accent)] text-white text-xs font-semibold shrink-0">
            {currentOrg.name.charAt(0)}
          </div>
          <span className="max-w-[140px] truncate">{currentOrg.name}</span>
          <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-48 bg-[var(--surface-raised)] border-[var(--border-color)]"
      >
        {mockOrganizations.map(org => (
          <DropdownMenuItem
            key={org.id}
            className="flex items-center gap-2 text-sm cursor-pointer"
          >
            <div className="flex items-center justify-center w-5 h-5 rounded bg-[var(--surface)] text-[var(--text-secondary)] text-xs font-semibold shrink-0">
              {org.name.charAt(0)}
            </div>
            {org.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
