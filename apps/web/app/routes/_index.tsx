import type { MetaFunction } from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ]
}

export default function Index() {
  return (
    <div className="m-4 leading-8">
      <h1 className="mb-4 text-4xl font-bold">Hyperlocal Web</h1>
    </div>
  )
}
