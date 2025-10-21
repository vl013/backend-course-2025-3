const {program}=require('commander'); 
program  
.requiredOption('-i, --input <file>', 'Input file JSON') 
.option('-o, --output<file>', 'Way to file where save results') 
.option('-d, --display', 'Output in console') 
.option('-f, --furnished', 'Furnished house') 
.option('-p, --price <number>', 'price less then:',parseInt); 
 
program.parse(process.argv); 
const options = program.opts(); 
console.log('Option:',options); 
const fs = require('fs'); 

if(!options.input){ 
  console.error('Please,specify input file'); 
  process.exit(1); 
} 

if(!fs.existsSync(options.input)) { 
  console.error('Cannot find input file'); 
  process.exit(1); 
} 

if(!options.output &&!options.display&&!options.furnished&&!options.price){ 
  process.exit(0); 
} 

const rawData = fs.readFileSync(options.input, 'utf8'); 
let houses = JSON.parse(rawData); // читаємо масив об'єктів 
let filteredHouses = houses; 

if (options.furnished) { 
  filteredHouses = filteredHouses.filter(h => h.furnishingstatus === 'furnished'); 
} 

if (options.price) { 
  filteredHouses = filteredHouses.filter(h => h.price < options.price); 
} 

if (options.display) { 
  filteredHouses.forEach(house => { 
    console.log(`${house.price} ${house.area}`); 
  }); 
} 

if (options.output) { 
  const outputData = filteredHouses.map(h => `${h.price} ${h.area}`).join('\n'); 
  fs.writeFileSync(options.output, outputData, 'utf8'); 
} 
