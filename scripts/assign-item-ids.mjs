/**
 * Gives every new item a numeric id (the highest id + 1, in the order the files were added) and
 * writes its public link into the file, so Pages CMS shows it.
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

// 2. The read-only "link" field: https://fluxusfungus.com/p/<id>.
let linked = 0;
for (const name of readdirSync(DIR).filter(isNumeric)) {
  const path = join(DIR, name);
  const text = readFileSync(path, "utf8");
  const line = `link: ${SITE}/p/${Number.parseInt(name, 10)}`;
  let updated;
  if (/^link:.*$/m.test(text)) {
    updated = text.replace(/^link:.*$/m, line);
  } else if (/^title:.*$/m.test(text)) {
    updated = text.replace(/^(title:.*)$/m, `$1\n${line}`);
  } else {
    updated = `${line}\n${text}`;
  }
  if (updated !== text) {
    writeFileSync(path, updated);
    linked += 1;
  }
}
console.log(linked ? `Link written in ${linked} item(s).` : "Every item already has its numeric id and link.");
