import fs from 'fs';
let code = fs.readFileSync('src/components/BookingModal.tsx', 'utf-8');

// Optional chaining
code = code.replace(/services\.map\(/g, '(services || []).map(');
code = code.replace(/staff\.map\(/g, '(staff || []).map(');
code = code.replace(/daysToShow\.map\(/g, '(daysToShow || []).map(');
code = code.replace(/availableSlots\.map\(/g, '(availableSlots || []).map(');
code = code.replace(/timeStr\.split/g, '(timeStr || "").split');

fs.writeFileSync('src/components/BookingModal.tsx', code);
console.log("Patched BookingModal map calls");
