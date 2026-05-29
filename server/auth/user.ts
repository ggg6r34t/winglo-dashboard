import { parseRuntimeEnv } from '@/lib/env/runtime'

const DEV_USER_ID = 'local-dev-user'

export async function getCurrentUserId(): Promise<string> {
  const configuredUserId = process.env.WINGLO_DEFAULT_USER_ID?.trim()
  if (configuredUserId) return configuredUserId

  const runtime = parseRuntimeEnv(process.env)
  if (runtime.appEnv === 'production') {
    throw new Error('Production user resolution is not configured. Set WINGLO_DEFAULT_USER_ID or implement authenticated user resolution.')
  }

  return DEV_USER_ID
}
