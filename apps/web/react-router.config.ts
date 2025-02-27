// import { areas, categories, languages } from '@hyperlocal/consts'
// import { db } from '@hyperlocal/db'
import type { Config } from '@react-router/dev/config'

export default {
  ssr: true,
  prerender: ['/test'],
  // prerender: async () => {
  //   const routes = ['/robots.txt']
  //   // languages
  //   for (const lang of languages) {
  //     const langPath = lang.id === 'en' ? '/' : `/${lang.id}`
  //     routes.push(langPath)

  //     // area
  //     for (const area of areas) {
  //       const areaPath = `${lang.id === 'en' ? '/' : `/${lang.id}/`}area/${area.areaId}`
  //       routes.push(areaPath)

  //       // sitemap
  //       const sitemapPath = `/sitemap/${lang.id}.xml`
  //       routes.push(sitemapPath)

  //       // category
  //       for (const category of categories) {
  //         // ranking
  //         for (const rankType of ['rating', 'review', 'nearme']) {
  //           const rankPath = `${lang.id === 'en' ? '/' : `/${lang.id}/`}area/${area.areaId}/${category.id}/${rankType}`
  //           routes.push(rankPath)
  //         }
  //       }
  //     }

  //     // place
  //     const places = await db.selectFrom('places').select('id').execute()
  //     for (const place of places) {
  //       const placePath = `${lang.id === 'en' ? '/' : `/${lang.id}/`}place/${place.id}`
  //       routes.push(placePath)
  //     }
  //   }
  //   return routes
  // },
} satisfies Config
