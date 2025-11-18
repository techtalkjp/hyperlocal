import { areas, categories, languages } from '@hyperlocal/consts'
import type { Config } from '@react-router/dev/config'

export default {
  ssr: true,
  serverBuildFile: 'server/index.js',
  prerender: async () => {
    // Dynamically import db to ensure env vars are loaded
    const { db } = await import('@hyperlocal/db')

    const routes: string[] = []
    // languages
    for (const lang of languages) {
      const langPath = lang.id === 'en' ? '/' : `/${lang.id}`
      routes.push(langPath)

      // area
      for (const area of areas) {
        const areaPath = `${lang.id === 'en' ? '/' : `/${lang.id}/`}area/${area.areaId}`
        routes.push(areaPath)

        // category
        for (const category of categories) {
          // ranking
          for (const rankType of ['rating', 'review', 'nearme']) {
            const rankPath = `${lang.id === 'en' ? '/' : `/${lang.id}/`}area/${area.areaId}/${category.id}/${rankType}`
            routes.push(rankPath)
          }
        }
      }
    }

    // guide articles - only if DATABASE_URL is set
    if (process.env.DATABASE_URL) {
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
          const langPath = article.language === 'en' ? '' : `/${article.language}`
          const guidePath = `${langPath}/area/${article.areaId}/guide/${article.sceneId}`
          routes.push(guidePath)
        }

        if (articles.length === 0) {
          console.warn('⚠ Warning: No published guide articles found for prerendering')
        } else {
          console.log(`✓ Prerendering ${articles.length} guide articles`)
        }
      } catch (error) {
        console.error('Failed to fetch guide articles for prerendering:', error)
        console.error('Database URL:', process.env.DATABASE_URL)
        throw new Error(
          `Guide article prerendering failed: ${error instanceof Error ? error.message : String(error)}. ` +
            'This will result in missing guide pages in production. Build aborted.'
        )
      }
    }

    return routes
  },
} satisfies Config
