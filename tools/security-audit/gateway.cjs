const http = require("node:http");

const adminCookie = process.env.AUDIT_ADMIN_COOKIE;
const userCookie = process.env.AUDIT_USER_COOKIE;
if (!adminCookie || !userCookie) throw new Error("Synthetic cookies are required");

const loginPage = `<!doctype html><html><body><h1>Isolated audit login</h1><form method="post" action="/_audit/login"><label>Email<input name="email" type="email"></label><label>Password<input name="password" type="password"></label><button type="submit">Sign in</button></form></body></html>`;

function forward(req, res, host, port) {
  const headers = { ...req.headers, host: `localhost:${port}` };
  const upstream = http.request(
    { hostname: host, port, method: req.method, path: req.url, headers },
    (response) => {
      res.writeHead(response.statusCode ?? 502, response.headers);
      response.pipe(res);
    },
  );
  upstream.on("error", () => {
    if (!res.headersSent) res.writeHead(502);
    res.end();
  });
  req.pipe(upstream);
}

http.createServer((req, res) => forward(req, res, "audit-web", 4174)).listen(4174, "0.0.0.0");
http.createServer((req, res) => {
  if (req.url === "/_audit/login" && req.method === "GET") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    res.end(loginPage);
    return;
  }
  if (req.url === "/_audit/login" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024) req.destroy();
    });
    req.on("end", () => {
      const params = new URLSearchParams(body);
      const email = params.get("email");
      const password = params.get("password");
      const cookie = password === "audit-only-password" && email === "audit-admin@example.test"
        ? adminCookie
        : password === "audit-only-password" && email === "audit-user@example.test"
          ? userCookie
          : null;
      if (!cookie) {
        res.writeHead(401, { "cache-control": "no-store" });
        res.end("Invalid audit credentials");
        return;
      }
      res.writeHead(303, {
        "set-cookie": `${cookie}; Path=/; HttpOnly; SameSite=Lax`,
        location: "/",
        "cache-control": "no-store",
      });
      res.end();
    });
    return;
  }
  forward(req, res, "audit-admin", 4175);
}).listen(4176, "0.0.0.0");
