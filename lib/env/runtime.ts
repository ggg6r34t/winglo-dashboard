export type AppEnv = 'local' | 'preview' | 'production'
export type DataSource = 'mock' | 'live'

export interface RuntimeEnv {
  appEnv: AppEnv
  useMockData: boolean
  allowPreviewMockData: boolean
}

export function parseRuntimeEnv(source: Record<string, string | undefined>): RuntimeEnv {
  const rawAppEnv = source.NEXT_PUBLIC_APP_ENV ?? 'local'
  const appEnv: AppEnv =
    rawAppEnv === 'preview' || rawAppEnv === 'production' ? rawAppEnv : 'local'

  return {
    appEnv,
    useMockData: source.NEXT_PUBLIC_USE_MOCK_DATA === 'true',
    allowPreviewMockData: source.ALLOW_PREVIEW_MOCK_DATA === 'true',
  }
}

export function assertMockDataAllowed(runtimeEnv = parseRuntimeEnv(process.env)): void {
  if (!runtimeEnv.useMockData) return

  if (runtimeEnv.appEnv === 'production') {
    throw new Error('Production cannot run with mock data enabled. Set NEXT_PUBLIC_USE_MOCK_DATA=false.')
  }

  if (runtimeEnv.appEnv === 'preview' && !runtimeEnv.allowPreviewMockData) {
    throw new Error('Preview mock data requires ALLOW_PREVIEW_MOCK_DATA=true.')
  }
}

export function resolveDataSource(runtimeEnv = parseRuntimeEnv(process.env)): DataSource {
  assertMockDataAllowed(runtimeEnv)
  return runtimeEnv.useMockData ? 'mock' : 'live'
}
