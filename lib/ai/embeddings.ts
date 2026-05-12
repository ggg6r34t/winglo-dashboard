import OpenAI from 'openai'

const EMBEDDING_MODEL = 'text-embedding-3-small'

let client: OpenAI | null = null

function getClient(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return client
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') return Array(1536).fill(0)
  const response = await getClient().embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8000),
  })
  return response.data[0].embedding
}
