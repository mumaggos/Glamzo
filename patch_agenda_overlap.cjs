const fs = require('fs');

let content = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');

const regex = /const totalMinutes = startH \* 60 \+ startM \+ duration;\n\s*const endTimeStr = `\$\{String\(Math.floor\(totalMinutes \/ 60\) % 24\)\.padStart\(2, "0"\)\}:\$\{String\(totalMinutes % 60\)\.padStart\(2, "0"\)\}`;/;

const replacement = `const totalMinutes = startH * 60 + startM + duration;
      const endTimeStr = \`\$\{String(Math.floor(totalMinutes / 60) % 24).padStart(2, "0")}:\$\{String(totalMinutes % 60).padStart(2, "0")}\`;

      const checkOverlap = (b: any, sId: string | null) => {
        const bStart = b.start_time.split(':').map(Number);
        const bEnd = b.end_time.split(':').map(Number);
        const bStartMin = bStart[0] * 60 + bStart[1];
        const bEndMin = bEnd[0] * 60 + bEnd[1];
        
        const overlapsTime = inputTotalMin < bEndMin && bStartMin < totalMinutes;
        
        if (!overlapsTime) return false;
        if (b.staff_id === null) return true;
        if (sId !== null && b.staff_id !== sId) return false;
        
        return true;
      };

      const bookingsOnDay = bookings.filter((b: any) => b.booking_date === manualDate && b.booking_status !== 'cancelled');
      const targetStaffId = manualBookingType === "block" ? (manualStaffId === "all" ? null : manualStaffId) : manualStaffId;
      
      let hasOverlap = bookingsOnDay.some(b => checkOverlap(b, targetStaffId));

      if (hasOverlap) {
         alert("Operação cancelada! Já existe uma marcação ou bloqueio neste horário para o profissional selecionado.");
         setIsSavingManual(false);
         return;
      }`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', content);

