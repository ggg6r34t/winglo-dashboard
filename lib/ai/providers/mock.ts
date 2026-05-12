import type { AIProvider, CompletionOptions, CompletionResult } from './types'
import { getMockCompletion } from '../mocks'

function detectAgentType(options: CompletionOptions<unknown>): string {
  const systemText = (options.systemPrompt ?? '').toLowerCase()
  if (systemText.includes('intake agent')) return 'intake'
  if (systemText.includes('discovery agent')) return 'discovery'
  if (systemText.includes('scoring agent')) return 'scoring'
  if (systemText.includes('outreach agent')) return 'outreach'
  if (systemText.includes('company intelligence agent')) return 'research'
  if (systemText.includes('memory agent')) return 'memory'
  if (systemText.includes('analytics agent')) return 'analytics'
  return 'default'
}

export class MockProvider implements AIProvider {
  async complete<T = string>(options: CompletionOptions<T>): Promise<CompletionResult<T>> {
    const agentType = detectAgentType(options)
    const rawContent = getMockCompletion(agentType)

    const content = options.schema
      ? options.schema.parse(JSON.parse(rawContent))
      : (rawContent as T)

    return {
      content,
      tokensUsed: 0,
      model: 'mock',
      durationMs: 0,
    }
  }

  async *stream(options: CompletionOptions<unknown>): AsyncIterable<string> {
    const agentType = detectAgentType(options)
    yield getMockCompletion(agentType)
  }
}
