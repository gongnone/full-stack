import path from "path";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

const dataOpsPath = path.resolve(__dirname, "../../packages/data-ops/dist");

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      // /esm/icons/index.mjs only exports the icons statically, so no separate chunks are created
      "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
      // Explicit aliases for workspace package subpaths
      "@repo/data-ops/database": path.join(dataOpsPath, "db/database.js"),
      "@repo/data-ops/queries/links": path.join(dataOpsPath, "queries/links.js"),
      "@repo/data-ops/queries/evaluations": path.join(dataOpsPath, "queries/evaluations.js"),
      "@repo/data-ops/zod-schema/links": path.join(dataOpsPath, "zod/links.js"),
      "@repo/data-ops/zod-schema/queue": path.join(dataOpsPath, "zod/queue.js"),
      "@repo/data-ops/auth": path.join(dataOpsPath, "better-auth/auth.js"),
    },
  },
  plugins: [
    tsConfigPaths(),
    tanstackRouter({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
    cloudflare(),
  ],
  server: {
    watch: {
      ignored: ["**/.wrangler/state/**"],
    },
  },
});
