/**
 * Sharded CJK substring index (fallback when Jekyll plugin did not run).
 * Output: _site/search-index/manifest.json + _site/search-index/YYYY.json
 * Row format: [url, title, searchableText]
 */
import fs from "fs";
import path from "path";

const site = process.argv[2] || "_site";
const siteRoot = path.resolve(site);
const indexDir = path.join(siteRoot, "search-index");
const MAX_BODY_CHARS = 800;
const INDEX_VERSION = 2;

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function urlFromFile(file) {
  const rel = path.relative(siteRoot, file).replace(/\\/g, "/");
  const dir = path.dirname(rel);
  if (dir === "." || dir === "") return "/";
  return "/" + dir.replace(/^\/+/, "") + "/";
}

function yearBucket(url) {
  const m = url.match(/\/(\d{4})\//);
  return m ? m[1] : "misc";
}

function processFile(file) {
  const html = fs.readFileSync(file, "utf8");
  if (!html.includes("data-pagefind-body")) return null;

  const bodyMatch = html.match(
    /<div[^>]*\bdata-pagefind-body\b[^>]*>([\s\S]*?)<hr\s+style="visibility:\s*hidden/i
  );
  if (!bodyMatch) return null;

  const titleMatch =
    html.match(/data-pagefind-meta="title"[^>]*>([^<]+)/i) ||
    html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
    html.match(/<title>([^<|]+)/i);
  const subtitleMatch = html.match(/data-pagefind-meta="subtitle"[^>]*>([^<]+)/i);

  let text = stripTags(bodyMatch[1]);
  if (!text) return null;
  if (text.length > MAX_BODY_CHARS) text = text.slice(0, MAX_BODY_CHARS);

  const title = (titleMatch?.[1] || "").trim();
  const subtitle = (subtitleMatch?.[1] || "").trim();
  const search = [title, subtitle, text].filter(Boolean).join("\n");

  return [urlFromFile(file), title, search];
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, files);
    else if (name === "index.html") files.push(p);
  }
  return files;
}

if (!fs.existsSync(siteRoot)) {
  console.error(`[search-index] site directory not found: ${siteRoot}`);
  process.exit(1);
}

const rows = [];
for (const file of walk(siteRoot)) {
  const row = processFile(file);
  if (row) rows.push(row);
}

fs.mkdirSync(indexDir, { recursive: true });

/** @type {Record<string, string[][]>} */
const shards = {};
for (const row of rows) {
  const year = yearBucket(row[0]);
  (shards[year] ||= []).push(row);
}

const manifestShards = [];
let totalBytes = 0;

for (const year of Object.keys(shards).sort((a, b) => Number(b) - Number(a) || b.localeCompare(a))) {
  const data = shards[year];
  const rel = `/search-index/${year}.json`;
  const outPath = path.join(indexDir, `${year}.json`);
  const json = JSON.stringify(data);
  fs.writeFileSync(outPath, json);
  totalBytes += Buffer.byteLength(json, "utf8");
  manifestShards.push({ y: year, n: data.length, u: rel, b: Buffer.byteLength(json, "utf8") });
}

const manifest = { v: INDEX_VERSION, shards: manifestShards };
fs.writeFileSync(path.join(indexDir, "manifest.json"), JSON.stringify(manifest));
fs.writeFileSync(
  path.join(siteRoot, "search-index.json"),
  JSON.stringify({ v: INDEX_VERSION, manifest: "/search-index/manifest.json" })
);

console.log(
  `[search-index] ${rows.length} posts -> ${manifestShards.length} shards (${totalBytes} bytes under search-index/)`
);
