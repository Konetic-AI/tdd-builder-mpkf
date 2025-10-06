#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const OUT_DIRS = ['output', 'exports'];
const ORPHAN_RE = /\{\{[^}]+}}/g;
let failed = false;

for (const dir of OUT_DIRS) {
  const full = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(full)) continue;
  for (const fn of fs.readdirSync(full)) {
    if (!fn.endsWith('.md')) continue;
    const fp = path.join(full, fn);
    const txt = fs.readFileSync(fp, 'utf8');
    const matches = txt.match(ORPHAN_RE);
    if (matches && matches.length) {
      console.error(`❌ Orphan template variables in ${fp}: ${matches.join(', ')}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log('✅ No orphan variables detected.');
