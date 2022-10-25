import setupLogging from "./logging.ts";
import { startServer } from "./server.ts";

setupLogging(Deno.env.get("ENVIRONMENT") || "development");

const serverConfigFromEnv = () => {
  const asNumber = (str?: string) => str ? Number(str) : undefined;
  const asBoolean = (str?: string) => str ? Boolean(str) : undefined;
  return {
    port: asNumber(Deno.env.get("PORT")),
    cacheEnabled: asBoolean(Deno.env.get("CACHE_ENABLED")),
    cacheTtlMsBetterplace: asNumber(Deno.env.get("CACHE_TTL_MS_BETTERPLACE")),
    cacheTtlMsPlaces: asNumber(Deno.env.get("CACHE_TTL_MS_PLACES")),
    placesApiKey: Deno.env.get("PLACES_API_KEY"),
  };
};

await startServer(serverConfigFromEnv());
