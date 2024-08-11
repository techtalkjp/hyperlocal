import type { MetaFunction } from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    { title: 'Hyperlocal Admin' },
    { name: 'description', content: 'Admin' },
  ]
}

export default function Index() {
  return (
    <div className="m-4 leading-8">
      <h1 className="mb-4 text-4xl font-bold">Hyperlocal Admin</h1>
    </div>
  )
}
