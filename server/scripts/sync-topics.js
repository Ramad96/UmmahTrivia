/**
 * sync-topics.js
 *
 * Scans server/src/data/ for questions_*.json files, validates them,
 * and writes/updates server/src/data/topics.json (the topics manifest).
 *
 * Usage: npm run sync-topics  (from root or server directory)
 *
 * Rules:
 *  - A file must be a non-empty valid JSON array to be included.
 *  - Existing entries in topics.json keep their label/icon (safe to customise).
 *  - New topics get sensible defaults; add them to DEFAULTS below for custom values.
 *  - Topics whose files are missing or invalid are removed from the manifest.
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../src/data");
const MANIFEST_PATH = join(DATA_DIR, "topics.json");

// ── Default labels/icons for known topics ────────────────────────────────────
// Add an entry here when adding a new topic to give it a polished label/icon.
// If a topic has no entry here it will get a humanised key and a 📚 icon.
const DEFAULTS = {
  duas:     { label: "Du'as",          icon: "🤲" },
  facts:    { label: "Islamic Facts",  icon: "🌙" },
  fiqh:     { label: "Fiqh",          icon: "⚖️" },
  places:   { label: "Islamic Places", icon: "🕌" },
  prophets: { label: "Prophets",       icon: "📖" },
};

// ── Load existing manifest so we can preserve any custom edits ───────────────
let existing = [];
if (existsSync(MANIFEST_PATH)) {
  try {
    existing = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  } catch {
    existing = [];
  }
}
const existingMap = Object.fromEntries(existing.map((t) => [t.key, t]));

// ── Scan data folder ──────────────────────────────────────────────────────────
const files = readdirSync(DATA_DIR)
  .filter((f) => /^questions_(.+)\.json$/.test(f))
  .sort();

console.log(`\nScanning ${DATA_DIR}\n`);

const results = [];
let added = 0, kept = 0, skipped = 0;

for (const file of files) {
  const [, key] = file.match(/^questions_(.+)\.json$/);
  const filePath = join(DATA_DIR, file);

  let parsed;
  try {
    const raw = readFileSync(filePath, "utf8");
    parsed = JSON.parse(raw);
  } catch (err) {
    console.log(`  ✗ Skipped  "${key}" — invalid JSON: ${err.message}`);
    skipped++;
    continue;
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    console.log(`  ⚠ Skipped  "${key}" — file is empty or not an array`);
    skipped++;
    continue;
  }

  // Count questions by difficulty for the summary
  const counts = { easy: 0, medium: 0, hard: 0 };
  for (const q of parsed) {
    if (q.difficulty in counts) counts[q.difficulty]++;
  }
  const summary = `${parsed.length} q  (easy: ${counts.easy}  medium: ${counts.medium}  hard: ${counts.hard})`;

  if (existingMap[key]) {
    results.push(existingMap[key]); // preserve custom label/icon
    console.log(`  ✓ Kept     "${key}"  —  ${summary}`);
    kept++;
  } else {
    const def = DEFAULTS[key] ?? {
      label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      icon: "📚",
    };
    results.push({ key, label: def.label, icon: def.icon });
    console.log(`  + Added    "${key}"  —  ${summary}`);
    added++;
  }
}

// ── Write manifest ────────────────────────────────────────────────────────────
writeFileSync(MANIFEST_PATH, JSON.stringify(results, null, 2) + "\n");

console.log(`
Done.
  Kept:    ${kept}
  Added:   ${added}
  Skipped: ${skipped}

Active topics: ${results.map((t) => `${t.icon} ${t.key}`).join("  |  ")}

Restart the server to apply changes.
`);
