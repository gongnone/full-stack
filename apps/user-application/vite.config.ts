import path from "path";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

const dataOpsPath = path.resolve(__dirname, "../../packages/data-ops/dist");
const foundryCorePath = path.resolve(__dirname, "../../packages/foundry-core/src");

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      // /esm/icons/index.mjs only exports the icons statically, so no separate chunks are created
      "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
      // Explicit aliases for workspace package subpaths
      "@repo/data-ops/database": path.join(dataOpsPath, "src/db/database.js"),
      "@repo/data-ops/schema": path.join(dataOpsPath, "src/schema.js"),
      "@repo/data-ops/auth-schema": path.join(dataOpsPath, "src/drizzle-out/auth-schema.js"),
      "@repo/data-ops/queries/links": path.join(dataOpsPath, "src/queries/links.js"),
      "@repo/data-ops/queries/evaluations": path.join(dataOpsPath, "src/queries/evaluations.js"),
      "@repo/data-ops/zod-schema/links": path.join(dataOpsPath, "src/zod/links.js"),
      "@repo/data-ops/zod-schema/queue": path.join(dataOpsPath, "src/zod/queue.js"),
      "@repo/data-ops/auth": path.join(dataOpsPath, "src/auth.js"),
      "@repo/data-ops/queries/market-research": path.join(dataOpsPath, "src/queries/market-research.js"),
      // Foundry-core workspace package (uses TypeScript source directly)
      "@repo/foundry-core/schema": path.join(foundryCorePath, "schema/index.ts"),
      "@repo/foundry-core/queries/clients": path.join(foundryCorePath, "queries/clients.ts"),
      "@repo/foundry-core/queries": path.join(foundryCorePath, "queries/index.ts"),
      "@repo/foundry-core/zod/clients": path.join(foundryCorePath, "zod/clients.ts"),
      "@repo/foundry-core/zod/spokes": path.join(foundryCorePath, "zod/spokes.ts"),
      "@repo/foundry-core/zod/hubs": path.join(foundryCorePath, "zod/hubs.ts"),
      "@repo/foundry-core/zod": path.join(foundryCorePath, "zod/index.ts"),
      "@repo/foundry-core/types": path.join(foundryCorePath, "types/index.ts"),
      "@repo/foundry-core": path.join(foundryCorePath, "index.ts"),
    },
  },
  plugins: [
    tsConfigPaths(),
    tanstackRouter({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
    cloudflare({ viteEnvironment: { name: mode }, persistState: true }),
  ],
  server: {
    watch: {
      ignored: ["**/.wrangler/state/**"],
    },
  },
}));
