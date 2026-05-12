import OpenAI from 'openai'
import type { AIProvider, CompletionOptions, CompletionResult } from './types'
import { env } from '@/lib/env'

const DEFAULT_MODEL = 'gpt-4o'
const MAX_RETRIES = 3

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export class OpenAIProvider implements AIProvider {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({ apiKey: env.openaiApiKey })
  }

  async complete<T = string>(options: CompletionOptions<T>): Promise<CompletionResult<T>> {
    const model = options.model ?? DEFAULT_MODEL
    const messages = options.systemPrompt
      ? [{ role: 'system' as const, content: options.systemPrompt }, ...options.messages]
      : options.messages

    let lastError: Error | null = null

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const start = Date.now()
        const response = await this.client.chat.completions.create({
          model,
          messages,
          temperature: options.temperature ?? 0.3,
          max_tokens: options.maxTokens ?? 2000,
          response_format: options.schema ? { type: 'json_object' } : undefined,
        })

        const durationMs = Date.now() - start
        const rawContent = response.choices[0]?.message?.content ?? ''
        const tokensUsed = response.usage?.total_tokens ?? 0

        const content = options.schema
          ? options.schema.parse(JSON.parse(rawContent))
          : (rawContent as T)

        return { content, tokensUsed, model, durationMs }
      } catch (error) {
        lastError = error as Error
        const isRateLimit = (error as { status?: number }).status === 429
        const isServerError = (error as { status?: number }).status === 500

        if ((isRateLimit || isServerError) && attempt < MAX_RETRIES) {
          await sleep(Math.pow(2, attempt) * 1000)
          continue
        }
        throw error
      }
    }

    throw lastError
  }

  async *stream(options: CompletionOptions): AsyncIterable<string> {
    const messages = options.systemPrompt
      ? [{ role: 'system' as const, content: options.systemPrompt }, ...options.messages]
      : options.messages

    const stream = await this.client.chat.completions.create({
      model: options.model ?? DEFAULT_MODEL,
      messages,
      stream: true,
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content
      if (delta) yield delta
    }
  }
}
