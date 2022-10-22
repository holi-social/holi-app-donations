import setupLogging from "./logging.ts";
import { CACHE_TTL_MS_DEFAULT, startServer } from "./server.ts";

const PORT = 8001;

setupLogging(Deno.env.get("ENVIRONMENT") || "development");

await startServer({
  port: PORT,
  withCache: true,
  cacheTtlMs: Number(Deno.env.get("CACHE_TTL_MS") || CACHE_TTL_MS_DEFAULT),
});
