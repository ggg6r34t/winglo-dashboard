import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/dashboard',     destination: '/workspace',               permanent: true },
      { source: '/orchestration', destination: '/workspace/live',          permanent: true },
      { source: '/opportunities',             destination: '/agents/growth/opportunities', permanent: true },

      { source: '/outreach',      destination: '/agents/growth/outreach',  permanent: true },
      { source: '/memory',        destination: '/agents/growth/memory',    permanent: true },
      { source: '/analytics',     destination: '/agents/growth/analytics', permanent: true },
      { source: '/intake',        destination: '/agents/growth/intake',    permanent: true },
      { source: '/settings',      destination: '/workspace/settings',      permanent: true },
    ]
  },
}

export default nextConfig
