// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // CERION is deployed independently on Vercel; pin the production artifact
  // instead of inheriting Lovable's Cloudflare default.
  nitro: { preset: "vercel" },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return undefined;
            if (id.includes("@firebase/firestore") || id.includes("firebase/firestore")) {
              return "firebase-firestore";
            }
            if (id.includes("@firebase/auth") || id.includes("firebase/auth")) {
              return "firebase-auth";
            }
            if (id.includes("@firebase/functions") || id.includes("firebase/functions")) {
              return "firebase-functions";
            }
            if (id.includes("@firebase/app-check") || id.includes("firebase/app-check")) {
              return "firebase-app-check";
            }
            if (id.includes("firebase")) return "firebase-core";
            if (id.includes("recharts") || id.includes("d3-")) return "charts";
            if (id.includes("@radix-ui") || id.includes("lucide-react")) return "ui";
            return "vendor";
          },
        },
      },
    },
    server: {
      host: "0.0.0.0",
      allowedHosts: ["terminal.local"],
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
