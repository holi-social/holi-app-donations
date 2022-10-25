import setupLogging from "./logging.ts";
import { DEFAULT_CACHE_TTL_MS, DEFAULT_PORT, startServer } from "./server.ts";

setupLogging(Deno.env.get("ENVIRONMENT") || "development");

const serverConfig = {
  port: Number(Deno.env.get("PORT") || DEFAULT_PORT),
  enableCache: true,
  cacheTtlMs: Number(Deno.env.get("CACHE_TTL_MS") || DEFAULT_CACHE_TTL_MS),
  placesApiKey: Deno.env.get("PLACES_API_KEY"),
};

await startServer(serverConfig);
