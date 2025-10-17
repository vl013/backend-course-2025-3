
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


if (!opts.input) {
  console.error('Please, specify input file');
  process.exit(1);
}

const inputPath = path.resolve(opts.input);
if (!fs.existsSync(inputPath)) {
  console.error('Cannot find input file');
  process.exit(1);
}


function findArrayIn(obj) {
  if (Array.isArray(obj)) return obj;
  if (obj && typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      if (Array.isArray(obj[k])) return obj[k];
    }
  }
  return [];
}


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


  const items = records.length ? records : (Array.isArray(parsed) ? parsed : [parsed]);

  const outLines = [];

  for (const it of items) {

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

 
    const priceOut = isNaN(toNumber(priceVal)) ? '' : String(toNumber(priceVal));
    const areaOut = isNaN(toNumber(areaVal)) ? '' : String(toNumber(areaVal));


    outLines.push(`${priceOut} ${areaOut}`.trim());
  }


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

  if (err.code === 'ENOENT') {
    console.error('Cannot find input file');
  } else if (err.name === 'SyntaxError') {
    console.error('Invalid JSON in input file');
  } else {
    console.error('Error:', err.message);
  }
  process.exit(1);
}
