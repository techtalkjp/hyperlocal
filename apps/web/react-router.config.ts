import { areas, categories, languages } from '@hyperlocal/consts'
import type { Config } from '@react-router/dev/config'

const getPrerenderPaths = async () => {
  // Dynamically import db to ensure env vars are loaded
  const { db } = await import('@hyperlocal/db')

  const routes: string[] = []
  // languages
  for (const lang of languages) {
    const langPrefix = lang.id === 'en' ? '' : `/${lang.id}`
    routes.push(langPrefix || '/')

    // area
    for (const area of areas) {
      routes.push(`${langPrefix}/area/${area.areaId}`)

      // category ranking
      for (const category of categories) {
        for (const rankType of ['rating', 'review', 'nearme']) {
          routes.push(
            `${langPrefix}/area/${area.areaId}/${category.id}/${rankType}`,
          )
        }
      }
    }
  }

  // guide articles and place detail pages
  if (process.env.DATABASE_URL) {
    try {
      try {
        const articles = await db
          .selectFrom('areaArticles')
          .select(['areaId', 'sceneId', 'language'])
          .where('status', '=', 'published')
          .where('areaId', 'is not', null)
          .where('sceneId', 'is not', null)
          .where('language', 'is not', null)
          .execute()

        for (const article of articles) {
          const langPrefix =
            article.language === 'en' ? '' : `/${article.language}`
          routes.push(
            `${langPrefix}/area/${article.areaId}/guide/${article.sceneId}`,
          )
        }

        console.log(`✓ Prerendering ${articles.length} guide articles`)
      } catch (error) {
        throw new Error(
          `Guide article prerendering failed: ${error instanceof Error ? error.message : String(error)}. Build aborted.`,
        )
      }

      // place detail pages
      try {
        const places = await db
          .selectFrom('localizedPlaces')
          .select(['placeId', 'language'])
          .execute()

        for (const place of places) {
          const langPrefix = place.language === 'en' ? '' : `/${place.language}`
          routes.push(`${langPrefix}/place/${place.placeId}`)
        }

        console.log(`✓ Prerendering ${places.length} place detail pages`)
      } catch (error) {
        throw new Error(
          `Place prerendering failed: ${error instanceof Error ? error.message : String(error)}. Build aborted.`,
        )
      }
    } finally {
      await db.destroy()
    }
  }

  return routes
}

export default {
  ssr: false,
  prerender: {
    paths: getPrerenderPaths,
    unstable_concurrency: 10,
  },
} satisfies Config
