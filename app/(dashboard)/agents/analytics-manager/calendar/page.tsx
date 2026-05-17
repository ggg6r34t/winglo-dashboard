import { CalendarTab } from '@/components/agents/tabs/calendar-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function AnalyticsManagerCalendarPage() {
  return <CalendarTab agent={getAgentBySlug('analytics-manager')} />
}
