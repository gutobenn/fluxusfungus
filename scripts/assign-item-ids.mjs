/**
 * Gives every new item a numeric id (the highest id + 1, in the order the files were added) and
 * writes its id and public link into the file, so Pages CMS can show and sort by them.
 *
 *   node scripts/assign-item-ids.mjs
 *
 * Pages CMS saves a new item under a temporary name (src/content/items/novo-….yml). The
 * "Assign item ids" GitHub Action runs this script on every push and commits the result, so each
 * item lives at fluxusfungus.com/p/<number>, as on the old site (Strapi ids).
 * Plain text edits only (no YAML re-serialization), so the files keep the Pages CMS formatting.
 */
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "src/content/items";
const SITE = "https://fluxusfungus.com";
const isNumeric = (name) => /^\d+\.yml$/.test(name);

function addedAt(name) {
  try {
    const out = execFileSync("git", ["log", "--diff-filter=A", "--format=%ct", "--", join(DIR, name)], { encoding: "utf8" });
    return Number(out.trim().split("\n").pop()) || Number.MAX_SAFE_INTEGER;
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
}

// 1. Numeric ids for new items.
const files = readdirSync(DIR).filter((name) => name.endsWith(".yml"));
let next = Math.max(0, ...files.filter(isNumeric).map((name) => Number.parseInt(name, 10))) + 1;
for (const name of files.filter((name) => !isNumeric(name)).sort((a, b) => addedAt(a) - addedAt(b) || a.localeCompare(b))) {
  renameSync(join(DIR, name), join(DIR, `${next}.yml`));
  console.log(`${name} -> ${next}.yml`);
  next += 1;
}

// 2. The read-only "id" and "link" fields, so Pages CMS can show and sort by them, and a "date"
// (today, São Paulo time) for an item saved without one. An existing date is never changed.
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
let updatedCount = 0;
for (const name of readdirSync(DIR).filter(isNumeric)) {
  const path = join(DIR, name);
  const id = Number.parseInt(name, 10);
  const text = readFileSync(path, "utf8");
  let lines = text.split("\n").filter((line) => !/^(id|link):/.test(line));
  const dated = lines.some((line) => /^date:\s*["']?\d{4}-\d{2}-\d{2}/.test(line));
  if (!dated) {
    lines = lines.filter((line) => !/^date:/.test(line));
  }
  const titleIndex = lines.findIndex((line) => /^title:/.test(line));
  lines.splice(titleIndex + 1, 0, `link: ${SITE}/p/${id}`, ...(dated ? [] : [`date: ${today}`]));
  const updated = [`id: ${id}`, ...lines].join("\n");
  if (updated !== text) {
    writeFileSync(path, updated);
    updatedCount += 1;
  }
}
console.log(updatedCount ? `id, link or date written in ${updatedCount} item(s).` : "Every item already has its numeric id, link and date.");
