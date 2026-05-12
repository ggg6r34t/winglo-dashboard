import { headers } from 'next/headers'

export async function getClientKey(): Promise<string> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') return 'mock-client'
  const headersList = await headers()
  // NOTE: x-forwarded-for is spoofable without a trusted reverse proxy (Nginx/Cloudflare). Configure trusted proxy headers in production.
  const forwarded = headersList.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return ip
}
