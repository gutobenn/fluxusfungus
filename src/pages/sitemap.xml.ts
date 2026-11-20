import type { APIRoute } from "astro";
import { itemsFor, ROUTES } from "../lib/content";

export const GET: APIRoute = ({ site }) => {
  const paths = [
    ROUTES.pt.home, ROUTES.pt.about, ROUTES.pt.contaminations,
    ROUTES.en.home, ROUTES.en.about, ROUTES.en.contaminations,
    ...itemsFor("pt").map(({ key }) => ROUTES.pt.item(key)),
    ...itemsFor("en").map(({ key }) => ROUTES.en.item(key)),
  ];
  const urls = paths.map((path) => `  <url><loc>${new URL(path, site).href}</loc></url>`).join("\n");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
