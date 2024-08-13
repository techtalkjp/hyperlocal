import { Link } from '@remix-run/react'
import areas from '~/assets/areas.json'

export default function AdminIndex() {
  return (
    <div>
      <h1 className="text-xl font-bold">Areas</h1>
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
