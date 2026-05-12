import type { ZodSchema } from 'zod'

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface CompletionOptions<T = string> {
  messages: Message[]
  model?: string
  temperature?: number
  maxTokens?: number
  schema?: ZodSchema<T>
  systemPrompt?: string
}

export interface CompletionResult<T = string> {
  content: T
  tokensUsed: number
  model: string
  durationMs: number
}

export interface AIProvider {
  complete<T = string>(options: CompletionOptions<T>): Promise<CompletionResult<T>>
  stream(options: CompletionOptions): AsyncIterable<string>
}
