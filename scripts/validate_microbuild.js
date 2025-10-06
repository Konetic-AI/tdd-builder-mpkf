#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const OUT_DIRS = ['output', 'exports'];
let failed = false;

function checkFile(fp) {
  const txt = fs.readFileSync(fp, 'utf8');
  if (!txt.includes('## Micro Builds Guide')) {
    console.error(`❌ Missing "## Micro Builds Guide" in: ${fp}`);
    failed = true;
  }
}

for (const dir of OUT_DIRS) {
  const full = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(full)) continue;
  for (const fn of fs.readdirSync(full)) {
    if (fn.endsWith('.md')) checkFile(path.join(full, fn));
  }
}

if (failed) process.exit(1);
console.log('✅ Micro Builds Guide present in generated outputs.');
