import type { AIProvider, CompletionOptions, CompletionResult } from './types'

export class AnthropicProvider implements AIProvider {
  async complete<T = string>(_options: CompletionOptions<T>): Promise<CompletionResult<T>> {
    throw new Error(
      'AnthropicProvider is not yet implemented. Set AI_PROVIDER=openai or implement using @anthropic-ai/sdk.'
    )
  }

  async *stream(_options: CompletionOptions): AsyncIterable<string> {
    throw new Error('AnthropicProvider streaming is not yet implemented.')
  }
}
