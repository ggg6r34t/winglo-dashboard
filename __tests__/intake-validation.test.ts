import { describe, it, expect } from 'vitest'
import { intakeFormSchema } from '@/features/intake/validations'

describe('intakeFormSchema', () => {
  it('rejects empty name', () => {
    const result = intakeFormSchema.safeParse({ name: '', description: 'A description long enough' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path[0] === 'name')).toBe(true)
    }
  })

  it('rejects description under 20 characters', () => {
    const result = intakeFormSchema.safeParse({ name: 'My Business', description: 'Too short' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some(i => i.path[0] === 'description')).toBe(true)
    }
  })

  it('rejects invalid website URL', () => {
    const result = intakeFormSchema.safeParse({
      name: 'My Business',
      description: 'A description long enough to pass',
      website_url: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })

  it('accepts empty website_url', () => {
    const result = intakeFormSchema.safeParse({
      name: 'My Business',
      description: 'A description long enough to pass',
      website_url: '',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid input', () => {
    const result = intakeFormSchema.safeParse({
      name: 'Acme Corp',
      description: 'We build B2B SaaS tools for finance teams',
      website_url: 'https://acme.example.com',
    })
    expect(result.success).toBe(true)
  })
})
