// One-off repair: lines that were UTF-8 decoded as Windows-1252 and saved again ("Â·", "â€“").
// Usage: node scripts/fix-mojibake.mjs <file> [file…]
import { readFileSync, writeFileSync } from 'node:fs';

// Windows-1252 code points 0x80–0x9F that differ from Latin-1.
const CP1252 = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f,
};

function repair(line) {
  const bytes = [];
  for (const ch of line) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp < 0x100) bytes.push(cp);
    else if (CP1252[cp] !== undefined) bytes.push(CP1252[cp]);
    else return line; // genuine non-Latin text on this line — leave it alone
  }
  const fixed = Buffer.from(bytes).toString('utf8');
  return fixed.includes('�') ? line : fixed;
}

for (const file of process.argv.slice(2)) {
  const text = readFileSync(file, 'utf8');
  let changed = 0;
  const out = text
    .split('\n')
    .map((line) => {
      if (!/Â|â€/.test(line)) return line;
      const fixed = repair(line);
      if (fixed !== line) changed++;
      return fixed;
    })
    .join('\n');
  writeFileSync(file, out, 'utf8');
  console.log(`${file}: ${changed} lines repaired`);
}
