import { CalendarTab } from '@/components/agents/tabs/calendar-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function ResearchCalendarPage() {
  return <CalendarTab agent={getAgentBySlug('research')} />
}
