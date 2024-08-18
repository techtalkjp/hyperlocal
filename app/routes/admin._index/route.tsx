import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { requireAdminUser } from '~/services/auth.server'
import { listAreas } from './queries.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdminUser(request)
  const areas = await listAreas()
  return { areas }
}

export default function AdminIndex() {
  const { areas } = useLoaderData<typeof loader>()
  return (
    <div>
      <Link to="/admin/areas" className="hover:underline">
        <h1 className="text-xl font-bold">Areas</h1>
      </Link>

      <ul>
        {areas.map((area) => (
          <li key={area.id}>
            <Link className="hover:underline" to={`/admin/${area.id}`}>
              {area.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
