import type { AgentSlug } from '@/lib/agents/registry'
import { AGENT_REGISTRY } from '@/lib/agents/registry'

interface AvatarProps {
  size?: number
}

function GrowthAvatar({ size = 24 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="2.5" fill="currentColor" />
      <circle cx="8"  cy="12" r="2"   fill="currentColor" opacity="0.55" />
      <circle cx="32" cy="12" r="2"   fill="currentColor" opacity="0.55" />
      <circle cx="8"  cy="28" r="2"   fill="currentColor" opacity="0.55" />
      <circle cx="32" cy="28" r="2"   fill="currentColor" opacity="0.55" />
      <path d="M20 20L8 12M20 20L32 12M20 20L8 28M20 20L32 28"
        stroke="currentColor" strokeWidth="1.25" opacity="0.35" />
      <path d="M11 33L19 25L27 19L33 13"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="33" cy="13" r="2.5" fill="currentColor" />
    </svg>
  )
}

function SocialMediaAvatar({ size = 24 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="9"  r="4.5" fill="currentColor" />
      <circle cx="8"  cy="30" r="4.5" fill="currentColor" opacity="0.65" />
      <circle cx="32" cy="30" r="4.5" fill="currentColor" opacity="0.65" />
      <path d="M17 12.5L11 26.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <path d="M23 12.5L29 26.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <path d="M12.5 30L27.5 30" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    </svg>
  )
}

function SEOAvatar({ size = 24 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="4" y="8" width="32" height="5.5" rx="2.75" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7.5" y="9.75" width="8" height="2" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="4" y="19" width="30" height="3.5" rx="1.75" fill="currentColor" opacity="0.85" />
      <rect x="4" y="27" width="22" height="3.5" rx="1.75" fill="currentColor" opacity="0.55" />
      <rect x="4" y="35" width="14" height="3.5" rx="1.75" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

function MarketingAvatar({ size = 24 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M7 14H7a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h6V14H7Z" fill="currentColor" opacity="0.5" />
      <path d="M13 12.5L31 6.5V33.5L13 27.5V12.5Z" fill="currentColor" opacity="0.85" />
      <path d="M13 25V35H17V25" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M33 14.5Q37.5 20 33 25.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" opacity="0.55" />
    </svg>
  )
}

function TelehealthAvatar({ size = 24 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="17" y="5"  width="6" height="30" rx="3" fill="currentColor" opacity="0.8" />
      <rect x="5"  y="17" width="30" height="6"  rx="3" fill="currentColor" opacity="0.8" />
    </svg>
  )
}

function SalesAvatar({ size = 24 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="4"  y="7"  width="32" height="7" rx="1.5" fill="currentColor" opacity="0.9" />
      <rect x="9"  y="18" width="22" height="6" rx="1.5" fill="currentColor" opacity="0.6" />
      <rect x="14" y="28" width="12" height="6" rx="1.5" fill="currentColor" opacity="0.35" />
    </svg>
  )
}

function ResearchAvatar({ size = 24 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="18" cy="18" r="12" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <circle cx="18" cy="18" r="7.5" stroke="currentColor" strokeWidth="1.75" opacity="0.6" />
      <circle cx="18" cy="18" r="3.5" fill="currentColor" />
      <path d="M27 27L35 35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function OutreachAvatar({ size = 24 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M4 21L34 8L23 35L18 23Z" fill="currentColor" opacity="0.9" />
      <path d="M18 23L34 8" stroke="currentColor" strokeWidth="1.25" opacity="0.35" />
    </svg>
  )
}

function AnalyticsManagerAvatar({ size = 24 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path d="M5 33h30" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <path d="M5 33L13 21L20 26L29 13L35 17"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 33L13 27L20 31L29 22L35 26"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
      <circle cx="35" cy="17" r="2.5" fill="currentColor" />
    </svg>
  )
}

const AVATARS: Record<AgentSlug, React.ComponentType<AvatarProps>> = {
  'growth':            GrowthAvatar,
  'social-media':      SocialMediaAvatar,
  'seo':               SEOAvatar,
  'marketing':         MarketingAvatar,
  'telehealth':        TelehealthAvatar,
  'sales':             SalesAvatar,
  'research':          ResearchAvatar,
  'outreach':          OutreachAvatar,
  'analytics-manager': AnalyticsManagerAvatar,
}

interface AgentIdentityIconProps {
  slug: AgentSlug
  size?: number
  className?: string
}

export function AgentIdentityIcon({ slug, size = 24, className }: AgentIdentityIconProps) {
  const agent = AGENT_REGISTRY.find(a => a.slug === slug)
  const Avatar = AVATARS[slug]
  return (
    <span
      className={className}
      style={{ color: agent?.accent, display: 'inline-flex', alignItems: 'center' }}
    >
      <Avatar size={size} />
    </span>
  )
}
