import { log } from "./deps.ts";
import setupLogging from "./logging.ts";
import { startServer } from "./server.ts";

const PORT = 8001;

setupLogging(Deno.env.get("ENVIRONMENT") || "development");

startServer(PORT);

log.info(`Started on http://localhost:${PORT}/graphql`);
