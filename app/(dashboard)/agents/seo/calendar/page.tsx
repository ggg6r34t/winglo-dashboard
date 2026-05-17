import { CalendarTab } from '@/components/agents/tabs/calendar-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function SeoCalendarPage() {
  return <CalendarTab agent={getAgentBySlug('seo')} />
}
