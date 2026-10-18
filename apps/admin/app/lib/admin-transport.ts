export const ADMIN_HOST = "admin.hyper-local.app";
const HSTS = "max-age=31536000";

export async function adminTransport(
  request: Request,
  next: () => Promise<Response>,
): Promise<Response> {
  const url = new URL(request.url);
  if (url.hostname !== ADMIN_HOST) return next();

  if (url.protocol === "http:") {
    url.protocol = "https:";
    return Response.redirect(url, 308);
  }

  const response = await next();
  const headers = new Headers(response.headers);
  headers.set("Strict-Transport-Security", HSTS);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
