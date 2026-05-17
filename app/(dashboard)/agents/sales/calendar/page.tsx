import { CalendarTab } from '@/components/agents/tabs/calendar-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function SalesCalendarPage() {
  return <CalendarTab agent={getAgentBySlug('sales')} />
}
