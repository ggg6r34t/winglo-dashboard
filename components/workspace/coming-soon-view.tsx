interface ComingSoonViewProps {
  title: string
  description: string
}

export function ComingSoonView({ title, description }: ComingSoonViewProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-10 h-10 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-color)] flex items-center justify-center mb-4">
        <svg
          className="w-5 h-5 text-[var(--text-muted)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-xs text-[var(--text-muted)] max-w-xs leading-relaxed">{description}</p>
    </div>
  )
}
