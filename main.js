const { program } = require('commander');
const fs = require('fs');

program
  .requiredOption('-i, --input <file>', 'Input JSON file')
  .option('-o, --output <file>', 'Output file path')
  .option('-d, --display', 'Display result in console')
  .option('-f, --furnished', 'Show only furnished houses')
  .option('-p, --price <number>', 'Show only houses with price less than given', parseFloat);

program.parse(process.argv);
const options = program.opts();


if (!options.input) {
  console.error('Please, specify input file');
  process.exit(1);
}
if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}
if (!options.output && !options.display && !options.furnished && !options.price) {
  process.exit(0);
}


const rawData = fs.readFileSync(options.input, 'utf8');
let houses = JSON.parse(rawData);


let filtered = houses;

if (options.furnished) {
  filtered = filtered.filter(h => {
    const value = (h.furnishingstatus || '').toLowerCase();
    return value.includes('furnished');
  });
}

if (options.price) {
  filtered = filtered.filter(h => h.price < options.price);
}


if (options.display) {
  if (filtered.length === 0) {
    console.log('No matching records found');
  } else {
    filtered.forEach(h => console.log(`${h.price} ${h.area}`));
  }
}


if (options.output) {
  const outputData = filtered.map(h => `${h.price} ${h.area}`).join('\n');
  fs.writeFileSync(options.output, outputData, 'utf8');
  console.log(`Результат записано у файл ${options.output}`);
}
