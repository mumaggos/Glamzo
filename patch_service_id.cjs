const fs = require('fs');

function fixServiceId(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const regex = /const selectedSvc = services\.find\(\(s: any\) => s\.id === manualServiceId\);\n\s*const svcPrice = selectedSvc \? Number\(selectedSvc\.price\) : 0;\n\s*const \[startH, startM\] = manualStartTime\.split\(":"\)\.map\(Number\);\n\s*const duration = manualBookingType === "block" \? manualBlockDuration : \(selectedSvc \? Number\(selectedSvc\.duration_minutes\) : 15\);\n\s*const totalMinutes = startH \* 60 \+ startM \+ duration;\n\s*const endTimeStr = `\$\{String\(Math\.floor\(totalMinutes \/ 60\) % 24\)\.padStart\(2, "0"\)\}:\$\{String\(totalMinutes % 60\)\.padStart\(2, "0"\)\}`;\n\s*const payloadNotes = manualBookingType === "block" \n\s*\? `🛑 BLOQUEIO: \$\{manualReason\}` \n\s*: `Manual: \$\{manualClientName\} \$\{manualNotes\}`;\n\s*let finalServiceId = manualServiceId \|\| \(services\.length > 0 \? services\[0\]\.id : null\);/g;

  const replacement = `let finalServiceId = manualServiceId || (services.length > 0 ? services[0].id : null);
      const selectedSvc = services.find((s: any) => s.id === finalServiceId);
      const svcPrice = selectedSvc ? Number(selectedSvc.price) : 0;
      const [startH, startM] = manualStartTime.split(":").map(Number);
      const duration = manualBookingType === "block" ? manualBlockDuration : (selectedSvc ? Number(selectedSvc.duration_minutes) : 15);
      const totalMinutes = startH * 60 + startM + duration;
      const endTimeStr = \`\$\{String(Math.floor(totalMinutes / 60) % 24).padStart(2, "0")\}:\$\{String(totalMinutes % 60).padStart(2, "0")\}\`;
      
      const payloadNotes = manualBookingType === "block" 
        ? \`🛑 BLOQUEIO: \$\{manualReason\}\` 
        : \`Manual: \$\{manualClientName\} \$\{manualNotes\}\`;`;

  content = content.replace(regex, replacement);
  fs.writeFileSync(filePath, content);
}

fixServiceId('src/pages/staff/StaffDashboard.tsx');
fixServiceId('src/pages/partner/tabs/AgendaTab.tsx');

