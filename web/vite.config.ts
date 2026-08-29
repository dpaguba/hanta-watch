import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const ROUTES = ["/", "/news", "/data", "/about"];

/** Origin the deployed site answers on.
 *
 * Vercel hands every build its production domain, so canonical links, robots
 * and the sitemap follow the project wherever it is deployed rather than
 * naming a domain the repository cannot check for itself. `VITE_SITE_URL`
 * overrides it for any other host.
 */
function siteUrl(): string {
  const explicit = process.env.VITE_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:5173";
}

/** Writes the site address into the HTML, robots.txt and the sitemap. */
function siteMetadata(): Plugin {
  const site = siteUrl();
  return {
    name: "site-metadata",
    // Ahead of vite:build-html, which reads every <link href> as an asset
    // path and chokes on the percent signs of an unresolved placeholder.
    transformIndexHtml: {
      order: "pre",
      handler: (html: string) => html.replace(/%SITE_URL%/g, site),
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`,
      });
      const urls = ROUTES.map(
        (route) =>
          `  <url>\n    <loc>${site}${route}</loc>\n` +
          `    <changefreq>${route === "/" ? "hourly" : "weekly"}</changefreq>\n  </url>`,
      ).join("\n");
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source:
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          `${urls}\n</urlset>\n`,
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), siteMetadata()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          map: ["react-simple-maps"],
          charts: ["recharts"],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
  },
});
