/**
 * Build a lightweight substring index for CJK queries Pagefind tokenizes poorly.
 * Output: <site>/search-index.json — [{ u, title, t }]
 */
import fs from "fs";
import path from "path";

const site = process.argv[2] || "_site";
const siteRoot = path.resolve(site);
const outFile = path.join(siteRoot, "search-index.json");

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
  if (dir === ".") return "/";
  return "/" + dir + "/";
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

  const text = stripTags(bodyMatch[1]);
  if (!text) return null;

  return {
    u: urlFromFile(file),
    title: (titleMatch?.[1] || "").trim(),
    t: text,
  };
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

const entries = [];
for (const file of walk(siteRoot)) {
  const row = processFile(file);
  if (row) entries.push(row);
}

fs.writeFileSync(outFile, JSON.stringify(entries));
console.log(`[search-index] wrote ${entries.length} entries -> ${outFile}`);
