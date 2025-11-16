import { areas, categories, languages } from '@hyperlocal/consts'
import type { Config } from '@react-router/dev/config'

export default {
  ssr: true,
  serverBuildFile: 'server/index.js',
  // prerender: ['/test'],
  prerender: () => {
    const routes = ['/test']
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
    return routes
  },
} satisfies Config
