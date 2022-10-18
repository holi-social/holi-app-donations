import { log } from "./deps.ts";
import setupLogging from "./logging.ts";
import { createServer } from "./server.ts";

const PORT = 8001;

setupLogging(Deno.env.get("ENVIRONMENT") || "development");

const server = createServer(PORT, {
  placesApiKey: Deno.env.get("PLACES_API_KEY"),
});

await server.listenAndServe();

log.info(`Started on http://localhost:${PORT}/graphql`);
