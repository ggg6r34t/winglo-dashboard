import { env } from '@/lib/env'
import { MockProvider } from './mock'
import { OpenAIProvider } from './openai'
import { AnthropicProvider } from './anthropic'
import type { AIProvider } from './types'

function createProvider(): AIProvider {
  if (env.useMockData) return new MockProvider()
  if (env.aiProvider === 'anthropic') return new AnthropicProvider()
  return new OpenAIProvider()
}

export const ai: AIProvider = createProvider()
export type { AIProvider, CompletionOptions, CompletionResult, Message } from './types'
