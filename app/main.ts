import { logger, LogSeverity } from "./logging.ts";
import { startServer } from "./server.ts";

const environment = Deno.env.get("ENVIRONMENT") || "development";

logger.setUpLogger(
  environment,
  environment === "development" ? LogSeverity.DEFAULT : LogSeverity.INFO,
);

const serverConfigFromEnv = () => {
  const asNumber = (str?: string) => (str ? Number(str) : undefined);
  const asBoolean = (str?: string) => (str ? Boolean(str) : undefined);
  return {
    port: asNumber(Deno.env.get("PORT")),
    cacheEnabled: asBoolean(Deno.env.get("CACHE_ENABLED")),
    cacheTtlMsBetterplace: asNumber(Deno.env.get("CACHE_TTL_MS_BETTERPLACE")),
  };
};

await startServer(serverConfigFromEnv());
