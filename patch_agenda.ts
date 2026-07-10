import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf-8');

code = code.replace(
  '<option value="all">Toda a Equipa</option>{staff.map',
  '{staff.length === 0 ? <option value="all">Toda a Equipa</option> : <option value="" disabled hidden>Selecione um funcionário</option>}{staff.map'
);

fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', code);
console.log("Patched Agenda staff select");
