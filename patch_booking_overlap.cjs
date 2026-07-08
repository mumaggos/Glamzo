const fs = require('fs');

let content = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

const regex = /const checkOverlap = \(b: any, sId\?: string\) => \{[\s\n]*\/\/ Se a reserva\/bloqueio não tem staff_id.*?[\s\n]*if \(b\.staff_id === null\) return true;[\s\n]*if \(sId && b\.staff_id !== sId\) return false;[\s\n]*const bStart = timeToMinutes\(b\.start_time\);[\s\n]*const bEnd = timeToMinutes\(b\.end_time\);[\s\n]*return slotStart < bEnd && bStart < slotEnd;[\s\n]*\};/;

const replacement = `const checkOverlap = (b: any, sId?: string) => {
        const bStart = timeToMinutes(b.start_time);
        const bEnd = timeToMinutes(b.end_time);
        const overlapsTime = slotStart < bEnd && bStart < slotEnd;
        
        if (!overlapsTime) return false;
        if (b.staff_id === null) return true; // Bloqueio geral para aquele horário
        if (sId && b.staff_id !== sId) return false;
        
        return true;
      };`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/BookingModal.tsx', content);

