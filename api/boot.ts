import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createServer } from "http";
import { createSocketServer } from "./socket-server";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  const server = serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  // Attach Socket.IO
  createSocketServer(server as any);
} else {
  // Development: create HTTP server and attach Socket.IO
  const port = 3001;
  const server = createServer((req, res) => {
    // In dev, Vite handles the main app, but we need Socket.IO
    res.writeHead(200);
    res.end("Socket.IO server running on port " + port);
  });

  createSocketServer(server);
  server.listen(port, () => {
    console.log(`Socket.IO server running on http://localhost:${port}/`);
  });
}
