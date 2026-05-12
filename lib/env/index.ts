import { z } from 'zod'

const envSchema = z.object({
  supabaseUrl: z.string().url().min(1),
  supabaseAnonKey: z.string().min(1),
  supabaseServiceRoleKey: z.string().min(1),
  openaiApiKey: z.string().min(1),
  aiProvider: z.enum(['openai', 'anthropic']).default('openai'),
  useMockData: z.boolean(),
})

function parseEnv() {
  const raw = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    openaiApiKey: process.env.OPENAI_API_KEY ?? '',
    aiProvider: process.env.AI_PROVIDER ?? 'openai',
    useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true',
  }

  if (raw.useMockData) {
    // In mock mode, Supabase and OpenAI credentials are not required
    return {
      ...raw,
      supabaseUrl: raw.supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey: raw.supabaseAnonKey || 'placeholder',
      supabaseServiceRoleKey: raw.supabaseServiceRoleKey || 'placeholder',
      openaiApiKey: raw.openaiApiKey || 'sk-placeholder',
      aiProvider: (raw.aiProvider || 'openai') as 'openai' | 'anthropic',
    }
  }

  const result = envSchema.safeParse(raw)
  if (!result.success) {
    const missing = result.error.issues.map(i => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`Missing or invalid environment variables:\n${missing}\n\nSet NEXT_PUBLIC_USE_MOCK_DATA=true for local development.`)
  }

  return result.data
}

export const env = parseEnv()
