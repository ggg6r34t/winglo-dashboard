import { PageHeader } from '@/components/shared/page-header'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="w-full max-w-sm p-8 rounded-lg border border-[var(--border-color)] bg-[var(--surface)]">
        <PageHeader
          title="Winglo"
          subtitle="Sign in to your account"
        />
        <p className="text-sm text-[var(--text-muted)] mt-4">
          Authentication is not yet configured. Access the dashboard directly at{' '}
          <a href="/dashboard" className="text-[var(--accent)] hover:underline">
            /dashboard
          </a>
          .
        </p>
      </div>
    </div>
  )
}
