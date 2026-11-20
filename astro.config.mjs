// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://fluxusfungus.com",
  // /sobre and /p/26 (no trailing slash), as on the Next.js site.
  build: { format: "file" },
  trailingSlash: "never",
});
