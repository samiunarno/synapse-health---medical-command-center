const fs = require('fs');

let code = fs.readFileSync('src/i18n.ts', 'utf8');

// I'll extract the JSON objects with a simple regex for keys to just de-duplicate lines.
// However, since it's a TS file with `const resources = { en: { translation: { ... } }, zh: { translation: { ... } } };`,
// It's much safer to parse it if we can. But it's not valid JSON, it's valid JS/TS.
// Let's use a line-by-line approach to remove duplicate keys for "en" and "zh".

function deduplicateBlock(block) {
  const lines = block.split('\n');
  const seenKeys = new Set();
  const filteredLines = [];

  for (let i = lines.length - 1; i >= 0; i--) {
    const text = lines[i];
    const match = text.match(/^\s*["']([^"']+)["']\s*:/);
    if (match) {
      const key = match[1];
      if (seenKeys.has(key)) {
        // Skip duplicate (keeping the last one found since we iterate backward, wait, no, keeping the first one found means iterating forward. Let's keep the last one inserted (top one usually from our script? No top one was from our script, so it's kept). 
        continue;
      }
      seenKeys.add(key);
    }
    filteredLines.unshift(text);
  }
  return filteredLines.join('\n');
}

const enMatch = code.match(/en:\s*\{\s*translation:\s*\{([\s\S]*?)\}\s*\},\s*zh:/);
if (enMatch) {
  const dedupedEn = deduplicateBlock(enMatch[1]);
  code = code.replace(enMatch[1], dedupedEn);
}

const zhMatch = code.match(/zh:\s*\{\s*translation:\s*\{([\s\S]*?)\}\s*\}\s*\};/);
if (zhMatch) {
  const dedupedZh = deduplicateBlock(zhMatch[1]);
  code = code.replace(zhMatch[1], dedupedZh);
}

fs.writeFileSync('src/i18n.ts', code);
console.log('Duplicates removed.');
