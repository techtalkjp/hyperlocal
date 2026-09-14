import { data } from 'react-router'
import {
  executionContext,
  type WorkerExecutionContext,
} from '~/lib/worker-context'
import type { Route } from './+types/api.internal.purge'

const VALID_TAGS = new Set(['top', 'area', 'guide', 'place'])

/**
 * Internal cache purge endpoint. Called by the admin worker after content
 * changes. Never cached (POST). Guarded by a shared bearer secret.
 */
export const action = async ({ request, context }: Route.ActionArgs) => {
  const auth = request.headers.get('authorization')
  const secret = process.env.PURGE_SECRET
  if (!secret || auth !== `Bearer ${secret}`) {
    throw new Response('Forbidden', { status: 403 })
  }

  const body = (await request.json().catch(() => null)) as {
    tags?: unknown
  } | null
  const tags = Array.isArray(body?.tags)
    ? body.tags.filter(
        (tag): tag is string => typeof tag === 'string' && VALID_TAGS.has(tag),
      )
    : []
  if (tags.length === 0) {
    return data({ error: 'No valid tags' }, { status: 400 })
  }

  let ctx: WorkerExecutionContext
  try {
    ctx = context.get(executionContext)
  } catch {
    return data({ error: 'Cache purge unavailable in this runtime' }, {
      status: 500,
    })
  }
  if (!ctx.cache) {
    return data({ error: 'Cache purge unavailable in this runtime' }, {
      status: 500,
    })
  }
  await ctx.cache.purge({ tags })
  return data({ purged: tags })
}

export const loader = async () => {
  throw new Response('Method Not Allowed', { status: 405 })
}
