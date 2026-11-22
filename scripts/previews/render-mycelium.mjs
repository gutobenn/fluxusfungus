/** Reproducible drawings: same geometry as the live p5 sketch, rendered as SVG/PNG. */
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { growMycelium, MYCELIUM_STUDIES, postPositions } from "../../src/scripts/mycelium-growth.js";
const directory = new URL("../../docs/mycelium-studies/", import.meta.url);
await mkdir(directory, { recursive: true });
const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const width = 1440, height = 900, seed = "fluxus-comparison-2026";
const tiles = [];
for (const [preset, config] of Object.entries(MYCELIUM_STUDIES)) {
  const growth = growMycelium({ width, height, seed, preset });
  const positions = postPositions(growth, 10);
  const lines = growth.segments.map((line) => `<path d="M${line.x.toFixed(2)} ${line.y.toFixed(2)}L${line.nx.toFixed(2)} ${line.ny.toFixed(2)}" stroke-width="${line.width.toFixed(2)}" stroke-opacity="${line.alpha.toFixed(2)}"/>`).join("");
  const dots = positions.map((point) => `<circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="5" fill="#e65742"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#302625"/><g font-family="monospace" fill="#eee"><text x="42" y="55" font-size="27">fluxus fungus</text><text x="42" y="95" font-size="17">${escape(config.title)}</text><text x="42" y="122" font-size="13" fill="#bbaa9d">${escape(config.description)}</text></g><g fill="none" stroke="#f3eee2" stroke-linecap="round">${lines}</g>${dots}</svg>`;
  await writeFile(new URL(`${preset}.svg`, directory), svg);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  await writeFile(new URL(`${preset}.png`, directory), png);
  tiles.push({ input: await sharp(png).resize(720,450).toBuffer(), left: (tiles.length % 2) * 720, top: Math.floor(tiles.length / 2) * 450 });
  console.log(`${preset}: ${growth.segments.length} segments, ${positions.length} item positions`);
}
await sharp({create: { width:1440,height:1350,channels:3, background:"#302625" }}).composite(tiles).png().toFile(new URL("comparison.png", directory).pathname);
