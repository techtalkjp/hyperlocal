import { areas, cities } from '@hyperlocal/consts'
import { Link } from 'react-router'
import { Button, HStack } from '~/components/ui'
import type { Route } from './+types/route'

export const loader = () => {
  return { cities, areas }
}

export default function AdminIndex({
  loaderData: { cities, areas },
}: Route.ComponentProps) {
  return (
    <div className="space-y-6">
      <HStack>
        <h1 className="text-xl font-bold">Articles</h1>
        <Button variant="outline" size="xs" asChild>
          <Link to="/articles">manage articles</Link>
        </Button>
      </HStack>

      <HStack>
        <h1 className="text-xl font-bold">Areas</h1>
        <Button variant="outline" size="xs" asChild>
          <Link to="/areas">area master</Link>
        </Button>
      </HStack>

      <ul>
        {areas.map((area) => {
          const city = cities.find((city) => city.cityId === area.cityId)
          return (
            <li key={area.areaId}>
              <Link
                className="hover:underline"
                to={`/${area.cityId}/${area.areaId}`}
              >
                {city?.i18n.en ?? `unknown - ${area.cityId}`} - {area.i18n.en}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
