const fs = require('fs');
let content = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

content = content.replace(/const dateStr = selectedDate\.toISOString\(\)\.split\('T'\)\[0\];/g, 
`const dateStr = [selectedDate.getFullYear(), String(selectedDate.getMonth() + 1).padStart(2, '0'), String(selectedDate.getDate()).padStart(2, '0')].join('-');`);

fs.writeFileSync('src/components/BookingModal.tsx', content);
