import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  base: "/willni/",
  server: {
    port: 5174,
    proxy: {
      "/willni/api": {
        target: "http://localhost:3333",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/willni/, ""),
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
