import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return formatDate(date)
}

export function scoreToColor(score: number): string {
  if (score >= 90) return '#22c55e'
  if (score >= 70) return '#84cc16'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

export function scoreToLabel(score: number): string {
  if (score >= 90) return 'Strong'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Moderate'
  return 'Weak'
}

// Strips characters that could be used for prompt injection attacks.
// Removes: backtick sequences, XML-like tags, "ignore previous" patterns.
export function sanitizeForPrompt(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')                          // strip HTML/XML tags
    .replace(/```[\s\S]*?```/g, '[code block]')       // collapse code fences
    .replace(/\bignore\s+(previous|above|all)\b/gi, '') // classic injection pattern
    .replace(/\bforget\s+(everything|all|previous)\b/gi, '')
    .replace(/\byou\s+are\s+now\b/gi, '')
    .trim()
    .slice(0, 2000) // hard cap: prevent token flooding
}
