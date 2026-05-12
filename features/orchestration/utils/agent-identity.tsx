import type { AgentType } from '@/types'

export const AGENT_ROLE: Record<AgentType, string> = {
  intake:    'Business Analyst',
  discovery: 'Discovery Coordinator',
  research:  'Research Analyst',
  scoring:   'Evaluation Analyst',
  outreach:  'Outreach Specialist',
  memory:    'Knowledge Manager',
  analytics: 'Analytics Director',
}

export const AGENT_DEPARTMENT: Record<AgentType, string> = {
  intake:    'Intelligence Intake',
  discovery: 'Opportunity Intelligence',
  research:  'Market Research',
  scoring:   'Lead Qualification',
  outreach:  'Growth & Outreach',
  memory:    'Memory & Knowledge',
  analytics: 'Performance Analytics',
}

export const AGENT_STANDBY_TEXT: Record<AgentType, string> = {
  intake:    'Monitoring for incoming profiles',
  discovery: 'Scanning market for opportunities',
  research:  'Ready to analyze profiles',
  scoring:   'Awaiting leads to evaluate',
  outreach:  'Standing by for engagement',
  memory:    'Indexing knowledge base',
  analytics: 'Monitoring performance metrics',
}

interface AvatarProps {
  className?: string
  size?: number
}

// Funnel filter — data flowing in
export function IntakeAvatar({ className, size = 24 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <rect x="5" y="8" width="30" height="2.5" rx="1.25" fill="currentColor" />
      <rect x="10" y="15" width="20" height="2.5" rx="1.25" fill="currentColor" opacity="0.75" />
      <rect x="14" y="22" width="12" height="2.5" rx="1.25" fill="currentColor" opacity="0.5" />
      <rect x="18" y="29" width="4" height="6" rx="2" fill="currentColor" opacity="0.8" />
    </svg>
  )
}

// Radar sweep — searching and exploring
export function DiscoveryAvatar({ className, size = 24 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <circle cx="20" cy="25" r="3.5" fill="currentColor" />
      <path d="M9 25a11 11 0 0 1 22 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 25a17 17 0 0 1 34 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
      <path d="M20 25 L30 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
      <circle cx="30" cy="9" r="2" fill="currentColor" opacity="0.85" />
    </svg>
  )
}

// Magnifying glass — deep analysis
export function ResearchAvatar({ className, size = 24 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <circle cx="17" cy="17" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M13 17h8M17 13v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M24 24l9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

// Rising bars — evaluation metrics
export function ScoringAvatar({ className, size = 24 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <path d="M6 32h28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      <rect x="7" y="24" width="6" height="8" rx="1" fill="currentColor" opacity="0.45" />
      <rect x="17" y="17" width="6" height="15" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="27" y="10" width="6" height="22" rx="1" fill="currentColor" />
    </svg>
  )
}

// Signal waves — communication broadcast
export function OutreachAvatar({ className, size = 24 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <circle cx="20" cy="20" r="3" fill="currentColor" />
      <path d="M14 14a8.5 8.5 0 0 0 0 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M26 14a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M8.5 8.5a16 16 0 0 0 0 23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M31.5 8.5a16 16 0 0 1 0 23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

// Hexagonal knowledge nodes
export function MemoryAvatar({ className, size = 24 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <path d="M20 7 L31 13.5 V26.5 L20 33 L9 26.5 V13.5 Z"
        stroke="currentColor" strokeWidth="1.75" fill="none" />
      <circle cx="20" cy="7"    r="2" fill="currentColor" />
      <circle cx="31" cy="13.5" r="2" fill="currentColor" />
      <circle cx="31" cy="26.5" r="2" fill="currentColor" />
      <circle cx="20" cy="33"   r="2" fill="currentColor" />
      <circle cx="9"  cy="26.5" r="2" fill="currentColor" />
      <circle cx="9"  cy="13.5" r="2" fill="currentColor" />
    </svg>
  )
}

// Ascending trend — performance analytics
export function AnalyticsAvatar({ className, size = 24 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <path d="M6 34h28" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.25" />
      <path d="M6 26h28" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.15" />
      <path d="M6 18h28" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.08" />
      <path d="M6 32 L14 24 L20 18 L28 12 L34 7"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="34" cy="7" r="3" fill="currentColor" />
    </svg>
  )
}

export const AGENT_AVATARS: Record<AgentType, React.ComponentType<AvatarProps>> = {
  intake:    IntakeAvatar,
  discovery: DiscoveryAvatar,
  research:  ResearchAvatar,
  scoring:   ScoringAvatar,
  outreach:  OutreachAvatar,
  memory:    MemoryAvatar,
  analytics: AnalyticsAvatar,
}
