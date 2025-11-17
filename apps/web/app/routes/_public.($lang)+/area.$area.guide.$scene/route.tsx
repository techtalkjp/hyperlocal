import { scenes } from '@hyperlocal/consts'
import { getMDXComponent } from 'mdx-bundler/client/index.js'
import { useMemo } from 'react'
import { data, Link } from 'react-router'
import { Card, CardHeader, CardTitle, Stack } from '~/components/ui'
import { getPathParams } from '~/features/city-area/utils'
import { compileMDX } from '~/services/mdx.server'
import type { Route } from './+types/route'
import { getArticle, getOtherArticlesForArea } from './queries.server'

export const meta = ({ data }: Route.MetaArgs) => {
  if (!data?.article) {
    return [{ title: 'Article Not Found' }]
  }

  const metadata =
    typeof data.article.metadata === 'string'
      ? JSON.parse(data.article.metadata)
      : data.article.metadata
  return [
    { title: data.article.title },
    { name: 'description', content: metadata.description },
  ]
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { lang, city, area } = getPathParams(request, params, {
    require: { area: true },
  })

  const sceneId = params.scene
  if (!sceneId) {
    throw new Response('Not Found', { status: 404 })
  }

  const scene = scenes.find((s) => s.id === sceneId)
  if (!scene) {
    throw new Response('Not Found', { status: 404 })
  }

  const article = await getArticle(city.cityId, area.areaId, sceneId, lang.id)
  if (!article) {
    throw data(
      { error: 'Article not found', lang, city, area, scene },
      { status: 404 },
    )
  }

  // Compile MDX
  const compiled = await compileMDX(article.content)
  if (!compiled) {
    throw new Response('Failed to compile article', { status: 500 })
  }

  // Get other articles for this area
  const otherArticles = await getOtherArticlesForArea(
    city.cityId,
    area.areaId,
    lang.id,
    sceneId,
  )

  return {
    lang,
    city,
    area,
    scene,
    article,
    mdxCode: compiled.code,
    otherArticles,
  }
}

// Place component for use in MDX
function Place({ id }: { id: string }) {
  // This is a simplified version - in production you'd fetch the place data
  // For now, we'll create a placeholder
  return (
    <div className="my-4 rounded border p-4">
      <div className="text-muted-foreground text-sm">Place component: {id}</div>
      <div className="text-muted-foreground text-xs">
        (Place details would be loaded here)
      </div>
    </div>
  )
}

export default function AreaGuideScenePage({
  loaderData,
}: Route.ComponentProps) {
  const { lang, area, scene, article, mdxCode, otherArticles } = loaderData

  const Component = useMemo(() => getMDXComponent(mdxCode), [mdxCode])

  const areaPath =
    lang.id === 'en'
      ? `/area/${area.areaId}`
      : `/${lang.id}/area/${area.areaId}`

  return (
    <Stack className="gap-8">
      {/* Breadcrumb */}
      <nav className="text-muted-foreground mx-auto w-full max-w-3xl px-4 text-sm">
        <Link to={areaPath} className="hover:underline">
          {area.i18n[lang.id]}
        </Link>
        <span className="mx-2">/</span>
        <span>{scene.i18n[lang.id]}</span>
      </nav>

      {/* Article */}
      <article className="mx-auto w-full max-w-3xl px-4">
        <h1 className="mb-8 text-4xl font-bold">{article.title}</h1>
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <Component components={{ Place }} />
        </div>
      </article>

      {/* Other guides for this area */}
      {otherArticles.length > 0 && (
        <div className="border-border mx-auto w-full max-w-3xl border-t px-4 pt-8">
          <h3 className="mb-3 font-semibold">
            Other Guides for {area.i18n[lang.id]}
          </h3>
          <div className="grid gap-2">
            {otherArticles.map((otherArticle) => {
              const otherScene = scenes.find(
                (s) => s.id === otherArticle.sceneId,
              )
              return (
                <Link
                  to={`../${otherArticle.sceneId}`}
                  key={otherArticle.sceneId}
                  prefetch="viewport"
                  viewTransition
                >
                  <Card className="hover:bg-secondary">
                    <CardHeader>
                      <CardTitle className="text-base">
                        {otherArticle.title}
                      </CardTitle>
                      {otherScene && (
                        <p className="text-muted-foreground text-sm">
                          {otherScene.description[lang.id]}
                        </p>
                      )}
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </Stack>
  )
}
