import { parseRuntimeEnv } from '@/lib/env/runtime'

const DEV_ORG_ID = '00000000-0000-0000-0000-000000000001'

export async function getCurrentOrgId(): Promise<string> {
  // Auth is not implemented in this repo yet. Local development remains
  // sign-in-free, while production fails instead of silently using demo data.
  const configuredOrgId = process.env.WINGLO_DEFAULT_ORG_ID?.trim()
  if (configuredOrgId) return configuredOrgId

  const runtime = parseRuntimeEnv(process.env)
  if (runtime.appEnv === 'production') {
    throw new Error('Production organization resolution is not configured. Set WINGLO_DEFAULT_ORG_ID or implement authenticated org membership.')
  }

  return DEV_ORG_ID
}
