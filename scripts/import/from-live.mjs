/**
 * One-time import from the live Next.js site (the Strapi API on Northflank was down).
 *
 *   node scripts/import/from-live.mjs
 *
 * Reads the __NEXT_DATA__ of https://fluxusfungus.com/ (pt) and /en, then writes:
 * - src/content/items/<id>.yml   one file per item (gallery, quote or video), pt + en
 * - src/content/pages/*.yml      "sobre" and "contaminacoes", pt + en
 * - src/assets/uploads/<file>    the original images, downloaded from Cloudinary
 * Downloads are cached in .import-cache/, so a second run is fast.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import TurndownService from "turndown";
import { stringify } from "yaml";

const SITE = "https://fluxusfungus.com";
const ROOT = new URL("../../", import.meta.url).pathname;
const CACHE = join(ROOT, ".import-cache");
const UPLOADS = join(ROOT, "src/assets/uploads");
const ITEMS = join(ROOT, "src/content/items");
const PAGES = join(ROOT, "src/content/pages");
for (const dir of [CACHE, UPLOADS, ITEMS, PAGES]) mkdirSync(dir, { recursive: true });

const turndown = new TurndownService({ headingStyle: "atx", emDelimiter: "_", bulletListMarker: "-" });

async function nextData(path) {
  const html = await (await fetch(SITE + path, { redirect: "follow" })).text();
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
  if (!match) throw new Error(`No __NEXT_DATA__ on ${path}`);
  return JSON.parse(match[1]).props.pageProps;
}

async function download(url) {
  const name = basename(new URL(url).pathname);
  const cached = join(CACHE, name);
  if (!existsSync(cached)) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status} for ${url}`);
    writeFileSync(cached, Buffer.from(await response.arrayBuffer()));
  }
  writeFileSync(join(UPLOADS, name), readFileSync(cached));
  return `/src/assets/uploads/${name}`;
}

const toMarkdown = (html) => turndown.turndown(html ?? "").trim();
const clean = (text) => (text ?? "").trim();
const firstWords = (text, count = 8) => {
  const words = text.replace(/[_*#>[\]()]/g, "").split(/\s+/).filter(Boolean);
  return words.slice(0, count).join(" ") + (words.length > count ? "…" : "");
};

const [pt, en] = await Promise.all([nextData("/"), nextData("/en")]);
const byId = new Map();
for (const [lang, data] of [["pt", pt], ["en", en]]) {
  for (const post of data.allPosts) {
    const entry = byId.get(post.id) ?? { id: post.id, type: post.type, status: post.status };
    entry[lang] = post.content;
    byId.set(post.id, entry);
  }
}

const statuses = {};
let images = 0;
for (const entry of [...byId.values()].sort((a, b) => Number(a.id) - Number(b.id))) {
  statuses[entry.status] = (statuses[entry.status] ?? 0) + 1;
  const ptContent = entry.pt ?? entry.en;
  const enContent = entry.en ?? entry.pt;
  const item = { title: "", show_pt: Boolean(entry.pt), show_en: Boolean(entry.en), content: {} };

  if (entry.type === "ComponentPagesGallery") {
    const pictures = [];
    for (const [index, picture] of ptContent.Picture.entries()) {
      const english = enContent.Picture[index] ?? {};
      pictures.push({
        image: await download(picture.image.url),
        caption_pt: clean(picture.caption),
        subcaption_pt: clean(picture.subcaption),
        caption_en: clean(english.caption),
        subcaption_en: clean(english.subcaption),
      });
      images++;
    }
    item.content = { type: "gallery", pictures };
    item.title = pictures[0].caption_pt || pictures[0].caption_en || `Galeria ${entry.id}`;
  } else if (entry.type === "ComponentPagesQuote") {
    item.content = {
      type: "quote",
      text_pt: entry.pt ? toMarkdown(entry.pt.content) : "",
      author_pt: clean(entry.pt?.author),
      text_en: entry.en ? toMarkdown(entry.en.content) : "",
      author_en: clean(entry.en?.author),
    };
    const author = item.content.author_pt || item.content.author_en;
    item.title = `${author ? author + ": " : ""}${firstWords(item.content.text_pt || item.content.text_en)}`;
  } else if (entry.type === "ComponentPagesVideo") {
    item.content = { type: "video", url: ptContent.URL };
    item.title = `Vídeo ${ptContent.URL}`;
  } else {
    throw new Error(`Unknown type ${entry.type} on item ${entry.id}`);
  }
  writeFileSync(join(ITEMS, `${entry.id}.yml`), stringify(item, { lineWidth: 0 }));
}

for (const [file, key, single] of [["sobre", "aboutPage", "about"], ["contaminacoes", "contaminationsPage", "contamination"]]) {
  const page = {
    title_pt: pt[key].title,
    content_pt: pt[key][single].content.trim(),
    title_en: en[key].title,
    content_en: en[key][single].content.trim(),
  };
  writeFileSync(join(PAGES, `${file}.yml`), stringify(page, { lineWidth: 0 }));
}

console.log(`items: ${byId.size} (status: ${JSON.stringify(statuses)}), images: ${images}, pages: 2`);
