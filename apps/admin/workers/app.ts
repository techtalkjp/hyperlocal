import { RouterContextProvider, createRequestHandler } from 'react-router'
import { envContext } from '../app/lib/request-context'

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  'production',
)

export default {
  fetch(request: Request, env: Record<string, string>) {
    const provider = new RouterContextProvider()
    provider.set(envContext, env)
    return requestHandler(request, provider)
  },
}
