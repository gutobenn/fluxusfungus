import type { ClientPost, Lang } from "./content";

export interface FeedEntry {
  post: ClientPost;
  date?: string;
}

const labels = {
  pt: { item: "Esporo", audio: "Ouvir áudio", video: "Assistir vídeo", language: "pt-BR" },
  en: { item: "Spore", audio: "Listen to audio", video: "Watch video", language: "en" },
};

/** Escape both XML text and HTML attributes, excluding characters forbidden in XML 1.0. */
function escape(value: string): string {
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

/** YAML stores a day, without a timezone. Do not fabricate dates for undated items. */
export function publicationDate(day: string | undefined): Date | undefined {
  if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return;
  const date = new Date(`${day}T00:00:00.000Z`);
  if (!Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === day) return date;
}

function absoluteHTML(html: string, site: URL): string {
  // Markdown links/images may point at site assets. A feed reader has no page-relative base.
  return html.replace(/\b(href|src)=("|')([^"']*)\2/g, (attribute, attr, quote, path) => {
    if (/^[a-z][a-z\d+.-]*:/i.test(path)) return attribute;
    return `${attr}=${quote}${escape(new URL(path.replace(/&amp;/g, "&"), site).href)}${quote}`;
  });
}

function titleFor(post: ClientPost, lang: Lang): string {
  const text = post.type === "quote" ? `${labels[lang].item} #${post.id}${post.author ? ` — ${post.author}` : ""}`
    : post.type === "gallery" ? post.pictures?.[0]?.caption : post.caption;
  const plain = (text ?? "").replace(/\s+/g, " ").trim();
  return plain || `${labels[lang].item} #${post.id}`;
}

function bodyFor(post: ClientPost, lang: Lang, site: URL): string {
  const paragraph = (text?: string) => text ? `<p>${escape(text)}</p>` : "";
  if (post.type === "quote") {
    return absoluteHTML(post.html ?? "", site) + paragraph(post.author);
  }
  if (post.type === "gallery") {
    return (post.pictures ?? []).map((picture) =>
      `<figure><img src="${escape(new URL(picture.src, site).href)}" alt="${escape(picture.caption)}" width="${picture.width}" height="${picture.height}" />` +
      `<figcaption>${paragraph(picture.caption)}${paragraph(picture.subcaption)}</figcaption></figure>`).join("\n");
  }
  const href = escape(new URL(post.url ?? "/", site).href);
  const media = post.type === "audio" ? `<audio controls="controls" src="${href}"></audio>` : "";
  return paragraph(post.caption) + paragraph(post.subcaption) + media +
    `<p><a href="${href}">${post.type === "audio" ? labels[lang].audio : labels[lang].video}</a></p>`;
}

/** Pure RSS serializer: stable GUIDs, stored dates, and the same localized content as the site. */
export function renderRSS({ entries, lang, site, name, description }: {
  entries: FeedEntry[];
  lang: Lang;
  site: URL;
  name: string;
  description: string;
}): string {
  const home = new URL(lang === "pt" ? "/" : "/en", site).href;
  const self = new URL(lang === "pt" ? "/rss.xml" : "/en/rss.xml", site).href;
  const ordered = [...entries].sort((a, b) =>
    (publicationDate(b.date)?.valueOf() ?? 0) - (publicationDate(a.date)?.valueOf() ?? 0) ||
    b.post.id.localeCompare(a.post.id, "en", { numeric: true }));
  const items = ordered.map(({ post, date }) => {
    const href = new URL(`${lang === "pt" ? "" : "/en"}/p/${post.id}`, site).href;
    const published = publicationDate(date);
    return `    <item>
      <title>${escape(titleFor(post, lang))}</title>
      <link>${escape(href)}</link>
      <guid isPermaLink="true">${escape(href)}</guid>${published ? `\n      <pubDate>${published.toUTCString()}</pubDate>` : ""}
      <description>${escape(bodyFor(post, lang, site))}</description>
    </item>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(name)}</title>
    <link>${escape(home)}</link>
    <description>${escape(description)}</description>
    <language>${labels[lang].language}</language>
    <atom:link href="${escape(self)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}
