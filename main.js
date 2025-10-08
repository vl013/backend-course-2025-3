// main.js
const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
const program = new Command();

program
  .option('-i, --input <path>', 'path to input JSON file')
  .option('-o, --output <path>', 'path to output file')
  .option('-d, --display', 'display result in console')
  .option('-f, --furnished', 'show only furnished houses')
  .option('-p, --price <number>', 'show only houses with price less than given', parseFloat);

program.parse(process.argv);
const opts = program.opts();

// Required input file check (exact error text as in lab)
if (!opts.input) {
  console.error('Please, specify input file');
  process.exit(1);
}

const inputPath = path.resolve(opts.input);
if (!fs.existsSync(inputPath)) {
  console.error('Cannot find input file');
  process.exit(1);
}

// Helper: find first array inside parsed JSON (top-level array or first property that is an array)
function findArrayIn(obj) {
  if (Array.isArray(obj)) return obj;
  if (obj && typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      if (Array.isArray(obj[k])) return obj[k];
    }
  }
  return [];
}

// Helper: get property by possible names (case-insensitive)
function getProp(obj, candidates) {
  if (!obj || typeof obj !== 'object') return undefined;
  const keys = Object.keys(obj);
  for (const cand of candidates) {
    const lc = cand.toLowerCase();
    for (const k of keys) {
      if (k.toLowerCase() === lc) return obj[k];
    }
  }
  return undefined;
}

// Helper: parse numeric value from possible price/area strings
function toNumber(val) {
  if (val == null) return NaN;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[, ]+/g, '').replace(/[^\d.-]/g, '');
  return cleaned === '' ? NaN : Number(cleaned);
}

try {
  const content = fs.readFileSync(inputPath, 'utf8');
  const parsed = JSON.parse(content);
  const records = findArrayIn(parsed);

  // If no array found, try to coerce object keys into single-record array
  const items = records.length ? records : (Array.isArray(parsed) ? parsed : [parsed]);

  const outLines = [];

  for (const it of items) {
    // find price and area fields with tolerant names
    const priceVal = getProp(it, ['price', 'Price', 'PRICE']);
    const areaVal = getProp(it, ['area', 'Area', 'size', 'sqft', 'square', 'area_m2', 'area_total']);
    const furnishingVal = getProp(it, ['furnishingstatus', 'furnishing_status', 'furnished', 'FurnishingStatus']);

    // filters
    if (opts.furnished) {
      const fv = (furnishingVal == null) ? '' : String(furnishingVal).toLowerCase();
      if (!fv.includes('furnish') && fv !== 'furnished') {
        // not furnished -> skip
        continue;
      }
    }

    if (typeof opts.price === 'number' && !isNaN(opts.price)) {
      const numericPrice = toNumber(priceVal);
      if (isNaN(numericPrice) || numericPrice >= opts.price) continue;
    }

    // Prepare strings for output (use raw numeric or empty)
    const priceOut = isNaN(toNumber(priceVal)) ? '' : String(toNumber(priceVal));
    const areaOut = isNaN(toNumber(areaVal)) ? '' : String(toNumber(areaVal));

    // Format: "<price> <area>"
    outLines.push(`${priceOut} ${areaOut}`.trim());
  }

  // If neither output nor display requested -> do nothing (lab requires silence)
  if (!opts.output && !opts.display) {
    // nothing to do
    process.exit(0);
  }

  if (opts.display) {
    for (const line of outLines) console.log(line);
  }

  if (opts.output) {
    const outPath = path.resolve(opts.output);
    fs.writeFileSync(outPath, outLines.join('\n'), 'utf8');
  }

} catch (err) {
  // If reading/parsing failed and file existed, show useful message
  if (err.code === 'ENOENT') {
    console.error('Cannot find input file');
  } else if (err.name === 'SyntaxError') {
    console.error('Invalid JSON in input file');
  } else {
    console.error('Error:', err.message);
  }
  process.exit(1);
}
