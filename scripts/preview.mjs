import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const url = new URL(
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
);
if (!["localhost", "127.0.0.1"].includes(url.hostname))
  throw new Error("Local preview requires a loopback NEXT_PUBLIC_SERVER_URL.");
if (!existsSync(".next/BUILD_ID"))
  throw new Error("Run npm run build before starting the compiled preview.");
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    url.port || "3000",
  ],
  {
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production", PANS_LOCAL_PREVIEW: "1" },
  },
);
child.on("exit", (code) => process.exit(code || 0));
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
