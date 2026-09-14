import { isbot } from 'isbot'
import { renderToReadableStream } from 'react-dom/server'
import { ServerRouter } from 'react-router'
import type { EntryContext, RouterContextProvider } from 'react-router'

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: RouterContextProvider,
) {
  const body = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} />,
    {
      signal: request.signal,
      onError(error: unknown) {
        // eslint-disable-next-line no-console
        console.error(error)
      },
    },
  )
  if (isbot(request.headers.get('user-agent') ?? '')) {
    await body.allReady
  }

  responseHeaders.set('Content-Type', 'text/html')
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  })
}
