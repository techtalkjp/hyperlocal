import { areas, cities } from '@hyperlocal/consts'
import type { LoaderFunctionArgs } from 'react-router'
import { Link, useLoaderData } from 'react-router'
import { Button, HStack } from '~/components/ui'
import { requireAdminUser } from '~/features/auth/services/user-session.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdminUser(request)
  return { cities, areas }
}

export default function AdminIndex() {
  const { cities, areas } = useLoaderData<typeof loader>()
  return (
    <div>
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
