/**
 * Reads the content that Pages CMS edits (YAML files in src/content) and prepares it for one
 * language: Markdown to HTML, gallery images optimized by Astro.
 */
import type { ImageMetadata } from "astro";
import { getImage } from "astro:assets";
import { Marked } from "marked";
import { parse } from "yaml";

export type Lang = "pt" | "en";

interface Picture {
  image: string;
  caption_pt?: string;
  subcaption_pt?: string;
  caption_en?: string;
  subcaption_en?: string;
}

type ItemContent =
  | { type: "gallery"; pictures: Picture[] }
  | { type: "quote"; text_pt?: string; author_pt?: string; text_en?: string; author_en?: string }
  | { type: "video"; url: string }
  | { type: "audio"; url: string };

interface ItemFile {
  title: string;
  show_pt?: boolean;
  show_en?: boolean;
  content: ItemContent;
}

interface PageFile {
  title_pt: string;
  content_pt: string;
  title_en: string;
  content_en: string;
}

export interface ClientPicture {
  src: string;
  srcset: string;
  width: number;
  height: number;
  thumb: string;
  caption: string;
  subcaption: string;
}

/** What the browser gets for one item (embedded as JSON in every page). */
export interface ClientPost {
  id: string;
  type: ItemContent["type"];
  html?: string;
  author?: string;
  pictures?: ClientPicture[];
  url?: string;
}

export interface ClientPage {
  title: string;
  html: string;
}

const itemFiles = import.meta.glob<string>("/src/content/items/*.yml", { query: "?raw", import: "default", eager: true });
const pageFiles = import.meta.glob<string>("/src/content/pages/*.yml", { query: "?raw", import: "default", eager: true });
const uploads = import.meta.glob<{ default: ImageMetadata }>("/src/assets/uploads/*", { eager: true });

const marked = new Marked({
  breaks: false,
  renderer: {
    // Same as remark-external-links on the old site: external links open in a new tab.
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const external = /^https?:\/\//.test(href);
      const attrs = external ? ' target="_blank" rel="nofollow noopener"' : "";
      return `<a href="${href}"${title ? ` title="${title}"` : ""}${attrs}>${text}</a>`;
    },
  },
});

export function markdown(text: string | undefined): string {
  return marked.parse(text ?? "", { async: false }) as string;
}

function keyOf(path: string): string {
  return path.split("/").pop()!.replace(/\.yml$/, "");
}

/**
 * Items with a numeric file name (the id in /p/<id>). A new item saved by Pages CMS has a
 * temporary name until the "Assign item ids" GitHub Action renames it, so it is skipped here.
 */
export function allItems(): { key: string; item: ItemFile }[] {
  return Object.entries(itemFiles)
    .filter(([path]) => {
      const numeric = /^\d+$/.test(keyOf(path));
      if (!numeric) console.warn(`Skipping ${path}: waiting for a numeric id (scripts/assign-item-ids.mjs).`);
      return numeric;
    })
    .map(([path, raw]) => ({ key: keyOf(path), item: parse(raw) as ItemFile }))
    .sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));
}

export function itemsFor(lang: Lang) {
  return allItems().filter(({ item }) => (lang === "pt" ? item.show_pt !== false : item.show_en !== false));
}

function imageMeta(path: string): ImageMetadata {
  const found = uploads[path] ?? uploads[path.replace(/^\/?/, "/")];
  if (!found) {
    throw new Error(`Image not found in src/assets/uploads: ${path}`);
  }
  return found.default;
}

async function clientPicture(picture: Picture, lang: Lang): Promise<ClientPicture> {
  const meta = imageMeta(picture.image);
  const caption = (lang === "pt" ? picture.caption_pt : picture.caption_en) || picture.caption_pt || "";
  const subcaption = (lang === "pt" ? picture.subcaption_pt : picture.subcaption_en) || picture.subcaption_pt || "";
  if (meta.format === "gif") {
    // Keep animated GIFs as they are.
    return { src: meta.src, srcset: "", width: meta.width, height: meta.height, thumb: meta.src, caption, subcaption };
  }
  const widths = [1000, 2000].filter((width) => width < meta.width);
  const sizes = [...widths, Math.min(meta.width, 2400)];
  const variants = await Promise.all(sizes.map((width) => getImage({ src: meta, width, format: "webp", quality: 82 })));
  const thumb = await getImage({ src: meta, width: 200, format: "webp", quality: 70 });
  const main = variants[0];
  return {
    src: main.src,
    srcset: variants.map((variant, index) => `${variant.src} ${sizes[index]}w`).join(", "),
    width: meta.width,
    height: meta.height,
    thumb: thumb.src,
    caption,
    subcaption,
  };
}

export async function clientPost(key: string, item: ItemFile, lang: Lang): Promise<ClientPost> {
  const content = item.content;
  switch (content.type) {
    case "gallery":
      return { id: key, type: "gallery", pictures: await Promise.all(content.pictures.map((picture) => clientPicture(picture, lang))) };
    case "quote": {
      const text = (lang === "pt" ? content.text_pt : content.text_en) || content.text_pt || content.text_en;
      const author = (lang === "pt" ? content.author_pt : content.author_en) || content.author_pt || content.author_en;
      return { id: key, type: "quote", html: markdown(text), author: author || undefined };
    }
    case "video":
    case "audio":
      return { id: key, type: content.type, url: content.url };
  }
}

export async function clientPosts(lang: Lang): Promise<ClientPost[]> {
  return Promise.all(itemsFor(lang).map(({ key, item }) => clientPost(key, item, lang)));
}

export function page(name: "sobre" | "contaminacoes", lang: Lang): ClientPage {
  const file = parse(pageFiles[`/src/content/pages/${name}.yml`]) as PageFile;
  return lang === "pt"
    ? { title: file.title_pt, html: markdown(file.content_pt) }
    : { title: file.title_en, html: markdown(file.content_en) };
}

/** Plain text for meta descriptions. */
export function plainText(html: string, max = 160): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
}

export const ROUTES = {
  pt: { home: "/", about: "/sobre", contaminations: "/contaminacoes", item: (id: string) => `/p/${id}` },
  en: { home: "/en", about: "/en/about", contaminations: "/en/contaminations", item: (id: string) => `/en/p/${id}` },
} as const;

export const SITE = {
  name: "fluxus fungus",
  description: {
    pt: "Nada é estático. Tudo é fluxo. Fluxus Fungus é um projeto da artista visual Tuane Eggers, desenvolvido por Augusto Bennemann — aberto a contaminações.",
    en: "Nothing is static. Everything is flow. Fluxus Fungus is a project by visual artist Tuane Eggers, developed by Augusto Bennemann - open to contaminations.",
  },
  analytics: "G-CK5VRR29RJ",
  music: "/pulse2.mp3",
};
