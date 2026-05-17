import { CalendarTab } from '@/components/agents/tabs/calendar-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function MarketingCalendarPage() {
  return <CalendarTab agent={getAgentBySlug('marketing')} />
}
