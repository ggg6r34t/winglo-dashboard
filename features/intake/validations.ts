import { z } from 'zod'

export const intakeFormSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters'),
  website_url: z
    .string()
    .url('Must be a valid URL (e.g. https://example.com)')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters'),
})

export type IntakeFormInput = z.infer<typeof intakeFormSchema>
