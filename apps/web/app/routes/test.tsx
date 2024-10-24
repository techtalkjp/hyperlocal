import { useLoaderData, type ClientLoaderFunctionArgs } from '@remix-run/react'

export const loader = () => {
  return { test: 'hello!' }
}

export const clientLoader = async ({
  serverLoader,
}: ClientLoaderFunctionArgs) => {
  const t = await serverLoader<typeof loader>()

  let position: GeolocationPosition | null = null
  if (navigator.geolocation) {
    position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject)
    }).catch((e) => {
      console.log(e)
      return null
    })
  }

  return { message: 'clientLoader', ...t, position }
}
clientLoader.hydrate = true

export default function TestPage() {
  const { message, test, position } = useLoaderData<typeof clientLoader>()
  return (
    <div className="p-2">
      <h1 className="text-2xl">Test</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>Message</div>
        <div>{message}</div>
        <div>Test</div>
        <div>{test}</div>
        <div>Position</div>
        <div>
          <div>latitude: {position?.coords.latitude}</div>
          <div>longitude: {position?.coords.longitude}</div>
          <div>accuracy: {position?.coords.accuracy}</div>
        </div>
      </div>
    </div>
  )
}
