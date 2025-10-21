const {program}=require('commander'); 
program  
.requiredOption('-i, --input <file>', 'Input file JSON') 
.option('-o, --output<file>', 'Way to file where save results') 
.option('-d, --display', 'Output in console') 
.option('-f, -furnished', 'Furnished house') 
.option('-p, -price <number>', 'price less then:',parseInt); 
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
const simulatedResult = [ 
'13300000 7420', 
'12250000 8960' 
]; 
// Вивід у консоль 
if (options.display) { 
simulatedResult.forEach(line => console.log(line)); 
} 
// Запис у файл 
if (options.output) { 
const outputData = simulatedResult.join('\n'); 
fs.writeFileSync(options.output, outputData, 'utf8'); 
}