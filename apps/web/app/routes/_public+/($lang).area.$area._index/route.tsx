import { areas, categories } from '@hyperlocal/consts'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Badge, Card, CardHeader, CardTitle, Stack } from '~/components/ui'
import { getPathParams } from '~/features/city-area/utils'
import { sortAreasByDistance } from '~/services/distance'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { lang, area } = await getPathParams(request, params)
  if (!area) {
    throw new Response('Not Found', { status: 404 })
  }

  const nearbyAreas = sortAreasByDistance(areas, area.latitude, area.longitude)
    .slice(0, 4)
    .filter((a) => a.distance < 3000)
    .filter((a) => a.areaId !== area.areaId)
  return { lang, area, nearbyAreas }
}

export default function AreaIndexPage() {
  const { lang, area, nearbyAreas } = useLoaderData<typeof loader>()
  return (
    <Stack>
      <div className="mx-auto my-8 gap-8">
        <Stack>
          <h3
            className="text-center text-4xl font-semibold leading-none tracking-tight"
            style={{ viewTransitionName: `area-title-${area.areaId}` }}
          >
            {area.i18n[lang.id]}
          </h3>
          <div className="text-center">
            <Badge variant="secondary">Area</Badge>
          </div>
        </Stack>

        <p
          className="mx-2 mt-8 max-w-96 text-sm text-muted-foreground"
          style={{ viewTransitionName: `area-description-${area.areaId}` }}
        >
          {area.description[lang.id]}
        </p>
      </div>

      <div>
        <h4 className="font-semibold">Places</h4>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <Link to={`${category.id}`} key={category.id} viewTransition>
              <Card className="hover:bg-secondary">
                <CardHeader>
                  <CardTitle
                    style={{
                      viewTransitionName: `nav-category-${category.id}`,
                    }}
                  >
                    {category.i18n[lang.id]}
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {nearbyAreas.length > 0 && (
        <div className="mt-8">
          <h4 className="font-semibold">Nearby Areas</h4>
          <div className="grid gap-1">
            {nearbyAreas.map((area) => (
              <Link
                to={`../${area.areaId}`}
                relative="path"
                key={area.areaId}
                viewTransition
              >
                <div className="flex rounded-md border p-2 hover:bg-secondary">
                  <div className="flex-1">
                    <div
                      className="font-semibold"
                      style={{
                        viewTransitionName: `area-title-${area.areaId}`,
                      }}
                    >
                      {area.i18n[lang.id]}
                    </div>
                    <div
                      className="text-xs text-muted-foreground"
                      style={{
                        viewTransitionName: `area-description-${area.areaId}`,
                      }}
                    >
                      {area.description[lang.id]}
                    </div>
                  </div>
                  <div>
                    <Badge variant="secondary">Area</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Stack>
  )
}
