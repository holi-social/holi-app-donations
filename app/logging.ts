import { log } from "./deps.ts";

const environment = Deno.env.get("ENVIRONMENT") || "development";

const setupLogging = () =>
  log.setup({
    handlers: {
      default: new log.handlers.ConsoleHandler("DEBUG", {
        formatter: ({ datetime, levelName, msg }) =>
          `${datetime.toISOString()} ${levelName} ${msg}`,
      }),
    },

    loggers: {
      default: {
        level: environment === "development" ? "DEBUG" : "INFO",
        handlers: ["default"],
      },
    },
  });

export default setupLogging;
