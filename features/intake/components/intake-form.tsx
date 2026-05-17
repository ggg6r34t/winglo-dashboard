'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { intakeFormSchema, type IntakeFormInput } from '../validations'
import { analyzeBusinessProfile } from '../server/actions'

const fieldStyle: React.CSSProperties = {
  width: '100%',
  fontSize: 13,
  background: 'var(--bg-2)',
  border: '1px solid var(--line-2)',
  borderRadius: 'var(--r-sm)',
  padding: '7px 10px',
  color: 'var(--fg-0)',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  color: 'var(--fg-3)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 6,
}

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
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <label htmlFor="name" style={labelStyle}>
          Business name <span style={{ color: 'var(--bad)' }}>*</span>
        </label>
        <input
          id="name"
          placeholder="Acme Corp"
          disabled={isPending}
          style={{ ...fieldStyle, borderColor: errors.name ? 'var(--bad)' : undefined }}
          {...register('name')}
        />
        {errors.name && (
          <p style={{ fontSize: 11, color: 'var(--bad)', marginTop: 4 }}>{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="website_url" style={labelStyle}>
          Website URL <span style={{ color: 'var(--fg-3)', fontFamily: 'inherit', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
        </label>
        <input
          id="website_url"
          placeholder="https://acme.example.com"
          disabled={isPending}
          style={{ ...fieldStyle, borderColor: errors.website_url ? 'var(--bad)' : undefined }}
          {...register('website_url')}
        />
        {errors.website_url && (
          <p style={{ fontSize: 11, color: 'var(--bad)', marginTop: 4 }}>{errors.website_url.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" style={labelStyle}>
          Business description <span style={{ color: 'var(--bad)' }}>*</span>
        </label>
        <textarea
          id="description"
          placeholder="Describe what your business does, who you sell to, and what problem you solve..."
          rows={5}
          disabled={isPending}
          style={{ ...fieldStyle, resize: 'none', lineHeight: 1.5, borderColor: errors.description ? 'var(--bad)' : undefined }}
          {...register('description')}
        />
        {errors.description && (
          <p style={{ fontSize: 11, color: 'var(--bad)', marginTop: 4 }}>{errors.description.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn primary"
        style={{ alignSelf: 'flex-start', opacity: isPending ? 0.6 : 1 }}
      >
        {isPending ? (
          <>
            <svg aria-hidden="true" style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing...
          </>
        ) : (
          'Analyze My Business'
        )}
      </button>
    </form>
  )
}
