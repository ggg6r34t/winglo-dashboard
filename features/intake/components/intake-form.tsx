'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { intakeFormSchema, type IntakeFormInput } from '../validations'
import { analyzeBusinessProfile } from '../server/actions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function IntakeForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IntakeFormInput>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: { name: '', website_url: '', description: '' },
  })

  function onSubmit(values: IntakeFormInput) {
    startTransition(async () => {
      await analyzeBusinessProfile(values)
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm text-[var(--text-secondary)]">
          Business name <span className="text-[var(--destructive)]">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Acme Corp"
          disabled={isPending}
          className={cn(
            'bg-[var(--surface-raised)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
            errors.name && 'border-[var(--destructive)]'
          )}
          {...register('name')}
        />
        {errors.name && (
          <p className="text-xs text-[var(--destructive)]">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="website_url" className="text-sm text-[var(--text-secondary)]">
          Website URL <span className="text-[var(--text-muted)] font-normal">(optional)</span>
        </Label>
        <Input
          id="website_url"
          placeholder="https://acme.example.com"
          disabled={isPending}
          className={cn(
            'bg-[var(--surface-raised)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
            errors.website_url && 'border-[var(--destructive)]'
          )}
          {...register('website_url')}
        />
        {errors.website_url && (
          <p className="text-xs text-[var(--destructive)]">{errors.website_url.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-sm text-[var(--text-secondary)]">
          Business description <span className="text-[var(--destructive)]">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe what your business does, who you sell to, and what problem you solve..."
          rows={5}
          disabled={isPending}
          className={cn(
            'bg-[var(--surface-raised)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none',
            errors.description && 'border-[var(--destructive)]'
          )}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-xs text-[var(--destructive)]">{errors.description.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <svg aria-hidden="true" className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing...
          </span>
        ) : (
          'Analyze My Business'
        )}
      </Button>
    </form>
  )
}
