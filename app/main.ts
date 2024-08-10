import { logger, LogSeverity } from "./logging.ts";
import {
  DEFAULT_CACHE_ENABLED,
  DEFAULT_CACHE_TTL_MS_BETTERPLACE,
  DEFAULT_PORT,
  ServerConfig,
  startServer,
} from "./server.ts";
import { DEFAULT_DB_CONNECTION_ATTEMPTS } from "./donations_db.ts";

const environment = Deno.env.get("ENVIRONMENT") || "development";

logger.setUpLogger(
  environment,
  environment === "development" ? LogSeverity.DEFAULT : LogSeverity.INFO,
);

const requiredEnv = <T>(
  name: string,
  typeFn: (s: string) => T,
  fallback?: T,
): T => {
  const env = Deno.env.get(name);
  if (env === undefined && fallback === undefined) {
    throw Error(`Environment variable "${name}" is required`);
  } else {
    return env !== undefined ? typeFn(env) : fallback!;
  }
};

const asBoolean = (str: string) => /^true$/i.test(str);

const fake = requiredEnv("FAKE", asBoolean, false); // For local development. If set, the API returns dummy data
const serverConfigFromEnv = (): ServerConfig => {
  return {
    port: requiredEnv("PORT", Number, DEFAULT_PORT),
    cacheEnabled: requiredEnv(
      "CACHE_ENABLED",
      asBoolean,
      DEFAULT_CACHE_ENABLED,
    ),
    cacheTtlMsBetterplace: requiredEnv(
      "CACHE_TTL_MS_BETTERPLACE",
      Number,
      DEFAULT_CACHE_TTL_MS_BETTERPLACE,
    ),
    donationsDB: {
      hostname: requiredEnv(
        "DB_HOST",
        String,
        fake ? "dummy value" : undefined,
      ),
      port: requiredEnv("DB_PORT", String, fake ? "31337" : undefined),
      database: requiredEnv(
        "DB_NAME",
        String,
        fake ? "dummy value" : undefined,
      ),
      username: requiredEnv(
        "DB_USERNAME",
        String,
        fake ? "dummy value" : undefined,
      ),
      password: requiredEnv(
        "DB_PASSWORD",
        String,
        fake ? "dummy value" : undefined,
      ),
      connectionAttempts: requiredEnv(
        "DB_CONNECTION_ATTEMPTS",
        Number,
        DEFAULT_DB_CONNECTION_ATTEMPTS,
      ),
    },
    fake,
  };
};

await startServer(serverConfigFromEnv());
