import { clientPost, itemsFor, SITE, type Lang } from "./content";
import { renderRSS } from "./rss";

export async function feedResponse(lang: Lang, site: URL | undefined): Promise<Response> {
  if (!site) throw new Error("RSS requires the canonical site URL in astro.config.mjs");
  const entries = await Promise.all(itemsFor(lang).map(async ({ key, item }) => ({
    post: await clientPost(key, item, lang),
    date: item.date,
  })));
  return new Response(renderRSS({ entries, lang, site, name: SITE.name, description: SITE.description[lang] }), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
