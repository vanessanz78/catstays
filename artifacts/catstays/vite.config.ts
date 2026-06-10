import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import type { IncomingMessage, ServerResponse } from "http";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { scrapeCatteryWebsite } from "../api-server/src/lib/catteryWebsiteScraper";

const rawPort = process.env.PORT;
const port = Number(rawPort ?? 5173);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";

function catstaysWebsiteScraperPlugin(): Plugin {
  return {
    name: "catstays-website-scraper",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const reqUrl = new URL(req.url ?? "/", "http://localhost");
        if (req.method !== "POST" || reqUrl.pathname !== "/api/website/scrape") {
          next();
          return;
        }

        try {
          const body = await readJsonBody(req);
          const targetUrl = typeof body.url === "string" ? body.url : "";
          const result = await scrapeCatteryWebsite(targetUrl);
          sendJson(res, 200, result);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          const status = message === "URL_REQUIRED" || message === "INVALID_URL" ? 400 : 422;
          sendJson(res, status, {
            error: scraperErrorMessage(message),
          });
        }
      });
    },
  };
}

function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 50_000) {
        reject(new Error("REQUEST_TOO_LARGE"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("BAD_JSON"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function scraperErrorMessage(message: string) {
  if (message === "PRIVATE_IP" || message === "DIRECT_IP") return "That URL is not accessible.";
  if (message === "DNS_FAILED") return "We couldn't reach that site — the domain could not be resolved.";
  if (message === "TIMEOUT") return "We couldn't reach that site — it took too long to respond.";
  if (message.startsWith("HTTP_")) return `That site returned ${message.replace("HTTP_", "HTTP ")}.`;
  return "We couldn't import that site yet. You can still use the demo fallback.";
}

export default defineConfig({
  base: basePath,
  define: {
    'import.meta.env.STRIPE_PUBLIC_KEY': JSON.stringify(process.env.STRIPE_PUBLIC_KEY ?? ''),
    'import.meta.env.API_URL': JSON.stringify(process.env.API_URL ?? ''),
  },
  plugins: [
    catstaysWebsiteScraperPlugin(),
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.API_SERVER_PORT ?? 8080}`,
        changeOrigin: true,
      },
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
