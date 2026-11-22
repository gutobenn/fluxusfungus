import assert from "node:assert/strict";
import { test } from "node:test";
import { publicationDate, renderRSS } from "../src/lib/rss.ts";

const site = new URL("https://fluxusfungus.com");
const render = (entries, lang = "pt") => renderRSS({ entries, lang, site, name: "fluxus fungus", description: "Fungos & contaminações" });
const quote = (id, date) => ({ post: { id, type: "quote", html: "<p>Fungos &amp; raízes</p>", author: "Tuane" }, date });

test("orders by real publication day, uses numeric ids to break ties, and leaves undated items last", () => {
  const xml = render([quote("99", "2020-01-01"), quote("9", "2026-11-21"), quote("10", "2026-11-21"), quote("100")]);
  assert.deepEqual([...xml.matchAll(/<guid isPermaLink="true">([^<]+)<\/guid>/g)].map((match) => match[1]), [
    `${site}p/10`, `${site}p/9`, `${site}p/99`, `${site}p/100`,
  ]);
  assert.equal((xml.match(/<pubDate>/g) ?? []).length, 3);
  assert.match(xml, /Sat, 21 Nov 2026 00:00:00 GMT/);
});

test("does not accept impossible, empty or malformed dates", () => {
  for (const value of [undefined, "", "tomorrow", "2026-02-30", "2026-13-01", "2026-1-1"]) {
    assert.equal(publicationDate(value), undefined);
  }
  assert.equal(publicationDate("2024-02-29").toISOString(), "2024-02-29T00:00:00.000Z");
});

test("quotes retain HTML and credits; relative Markdown assets and links become absolute", () => {
  const entry = quote("26", "2020-10-29");
  entry.post.html += '<p><a href="/sobre?x=1&amp;y=2">Sobre</a><img src="imagem.jpg" /></p>';
  const xml = render([entry]);
  assert.match(xml, /Fungos &amp;amp; raízes/);
  assert.match(xml, /&lt;p&gt;Tuane&lt;\/p&gt;/);
  assert.match(xml, /https:\/\/fluxusfungus.com\/sobre\?x=1&amp;amp;y=2/);
  assert.match(xml, /https:\/\/fluxusfungus.com\/imagem.jpg/);
  assert.match(xml, /<title>Esporo #26 — Tuane<\/title>/);
});

test("escapes gallery captions at both XML and HTML layers and uses built image URLs", () => {
  const xml = render([{ post: { id: "1", type: "gallery", pictures: [{
    src: "/_astro/fungo.webp", caption: 'Fungo <branco> & "verde"', subcaption: "[crédito]", width: 1000, height: 750,
  }] } }]);
  assert.match(xml, /<title>Fungo &lt;branco&gt; &amp; &quot;verde&quot;<\/title>/);
  assert.match(xml, /https:\/\/fluxusfungus.com\/_astro\/fungo.webp/);
  assert.match(xml, /Fungo &amp;lt;branco&amp;gt; &amp;amp; &amp;quot;verde&amp;quot;/);
  assert.match(xml, /\[crédito\]/);
});

test("audio and video have readable links, English labels and absolute media URLs", () => {
  const xml = render([
    { post: { id: "1", type: "audio", url: "/audio/fungo.mp3", caption: "Pulse" } },
    { post: { id: "2", type: "video", url: "https://vimeo.com/123?x=1&y=2", caption: "Hyphae" } },
  ], "en");
  assert.match(xml, /<language>en<\/language>/);
  assert.match(xml, /https:\/\/fluxusfungus.com\/en\/rss.xml/);
  assert.match(xml, /https:\/\/fluxusfungus.com\/en\/p\/1/);
  assert.match(xml, /https:\/\/fluxusfungus.com\/audio\/fungo.mp3/);
  assert.match(xml, /Listen to audio/);
  assert.match(xml, /Watch video/);
  assert.match(xml, /https:\/\/vimeo.com\/123\?x=1&amp;amp;y=2/);
});

test("GUIDs remain stable after editing content; forbidden XML controls are removed", () => {
  const entry = quote("26");
  const before = render([entry]).match(/<guid[^>]*>([^<]*)/)[1];
  entry.post.html = "<p>Outra citação\u0000</p>";
  const after = render([entry]);
  assert.equal(after.match(/<guid[^>]*>([^<]*)/)[1], before);
  assert.ok(!after.includes("\u0000"));
  assert.match(after, /<language>pt-BR<\/language>/);
});
