import { streamText } from './anthropic'
import { handle, type Env } from './handler'

export default {
  fetch: (request: Request, env: Env) => handle(request, env, { streamText }),
} satisfies ExportedHandler<Env>
