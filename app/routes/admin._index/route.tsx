import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import areas from '~/assets/areas.json'
import { requireAdminUser } from '~/services/auth.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdminUser(request)
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
          <li key={area.areaId}>
            <Link className="hover:underline" to={`/admin/${area.areaId}`}>
              {area.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
