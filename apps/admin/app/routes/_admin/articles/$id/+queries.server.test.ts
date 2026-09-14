import { sql } from '@hyperlocal/db'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { getDb } from '~/lib/db'
import type { AdminEnv } from '~/lib/request-context'
import { updateArticle } from './+queries.server'

const dir = mkdtempSync(join(tmpdir(), 'area-articles-'))
const env: AdminEnv = { DATABASE_URL: `file:${join(dir, 'test.db')}` }

async function setup() {
  const db = getDb(env)
  await sql`CREATE TABLE area_articles (id text NOT NULL, city_id text NOT NULL, area_id text NOT NULL, scene_id text NOT NULL, language text NOT NULL, title text NOT NULL, content text NOT NULL, compiled_code text NOT NULL, status text NOT NULL DEFAULT 'draft', metadata text NOT NULL, created_at datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), updated_at datetime NOT NULL, PRIMARY KEY (id))`.execute(
    db,
  )
  await db
    .insertInto('areaArticles')
    .values({
      id: 'r1',
      cityId: 'tokyo',
      areaId: 'asakusa',
      sceneId: 's',
      language: 'en',
      title: 'T',
      content: '# Old content',
      compiledCode: 'STALE_COMPILED',
      status: 'draft',
      metadata: '{}',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    })
    .execute()
}

afterAll(async () => {
  await getDb(env).destroy()
  rmSync(dir, { recursive: true, force: true })
})

describe('updateArticle', () => {
  it('recompiles MDX so the public page reflects edited content', async () => {
    await setup()
    const article = await updateArticle(env, 'r1', {
      title: 'T',
      content: '# New content here',
      metadata: '{}',
      status: 'draft',
    })
    expect(article.content).toBe('# New content here')
    expect(article.compiledCode).not.toContain('arguments[0]')
    expect(article.compiledCode).toContain('New content here')
  })
})
