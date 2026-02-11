const fs = require('fs');
const path = 'apps/lofi_library/src/GameGrid.svelte';
let code = fs.readFileSync(path, 'utf8');

// The professional audit values for your symbols
const auditValues = {
  "75.130": "12.00",
  "37.565": "6.00",
  "15.026": "2.80",
  "7.513": "1.50",
  "3.757": "0.85",
  "1.878": "0.70",
  "1.127": "0.45",
  "0.751": "0.15"
};

// Replace each high-precision decimal with the clean value
Object.keys(auditValues).forEach(oldVal => {
  code = code.replace(new RegExp(oldVal, 'g'), auditValues[oldVal]);
});

fs.writeFileSync(path, code);
console.log('✅ SUCCESS: Information card and symbols updated to clean audit values.');
