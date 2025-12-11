import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

async function createConfig() {
  const plugins = [react(), metaImagesPlugin()];

  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    const cartographer = (await import("@replit/vite-plugin-cartographer")).cartographer;
    const devBanner = (await import("@replit/vite-plugin-dev-banner")).devBanner;
    plugins.push(cartographer(), devBanner());
  }

  return defineConfig({
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    css: { postcss: { plugins: [] } },
    root: path.resolve(__dirname),
    build: { outDir: path.resolve(__dirname, "dist"), emptyOutDir: true },
    server: {
      host: "0.0.0.0",
      allowedHosts: true,
      fs: { strict: true, deny: ["**/.*"] },
    },
  });
}

export default await createConfig();
