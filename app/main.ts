import setupLogging from "./logging.ts";
import { startServer } from "./server.ts";

const PORT = 8001;

setupLogging(Deno.env.get("ENVIRONMENT") || "development");

await startServer(PORT);
