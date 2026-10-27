import Anthropic from '@anthropic-ai/sdk'
import type { StreamArgs } from './handler'

/** Stream the model's text deltas using the official SDK. */
export async function* streamText({ apiKey, model, system, user, signal }: StreamArgs): AsyncGenerator<string> {
  const client = new Anthropic({ apiKey })
  const stream = client.messages.stream(
    {
      model,
      // The answer is a few dozen tokens of JSON; this ceiling leaves room for any thinking on larger models.
      max_tokens: 1024,
      system,
      messages: [{ role: 'user', content: user }],
      output_config: { effort: 'low' },
    },
    { signal },
  )
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') yield event.delta.text
  }
}
