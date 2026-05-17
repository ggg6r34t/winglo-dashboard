import { CalendarTab } from '@/components/agents/tabs/calendar-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function SocialMediaCalendarPage() {
  return <CalendarTab agent={getAgentBySlug('social-media')} />
}
