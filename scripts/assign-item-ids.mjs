/**
 * Gives every new item a numeric id: the highest id + 1, in the order the files were added.
 *
 *   node scripts/assign-item-ids.mjs
 *
 * Pages CMS saves a new item under a temporary name (src/content/items/<name>.yml). The
 * "Assign item ids" GitHub Action runs this script on every push and commits the rename, so
 * each item lives at fluxusfungus.com/p/<number>, as on the old site (Strapi ids).
 */
import { execFileSync } from "node:child_process";
import { readdirSync, renameSync } from "node:fs";
import { join } from "node:path";

const DIR = "src/content/items";
const files = readdirSync(DIR).filter((name) => name.endsWith(".yml"));
const numeric = files.filter((name) => /^\d+\.yml$/.test(name));
const pending = files.filter((name) => !/^\d+\.yml$/.test(name));

function addedAt(name) {
  try {
    const out = execFileSync("git", ["log", "--diff-filter=A", "--format=%ct", "--", join(DIR, name)], { encoding: "utf8" });
    return Number(out.trim().split("\n").pop()) || Number.MAX_SAFE_INTEGER;
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
}

let next = Math.max(0, ...numeric.map((name) => Number.parseInt(name, 10))) + 1;
for (const name of pending.sort((a, b) => addedAt(a) - addedAt(b) || a.localeCompare(b))) {
  const target = `${next}.yml`;
  renameSync(join(DIR, name), join(DIR, target));
  console.log(`${name} -> ${target}`);
  next += 1;
}
if (!pending.length) console.log("All items already have a numeric id.");
