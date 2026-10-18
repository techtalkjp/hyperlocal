const WEB_HOST = "tokyo.hyper-local.app";

export async function webTransport(
  request: Request,
  next: () => Promise<Response>,
): Promise<Response> {
  const url = new URL(request.url);
  if (url.hostname !== WEB_HOST) return next();

  if (url.protocol === "http:") {
    url.protocol = "https:";
    return Response.redirect(url, 308);
  }

  const response = await next();
  const headers = new Headers(response.headers);
  headers.set("Strict-Transport-Security", "max-age=31536000");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
