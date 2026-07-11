import fs from 'fs';
let content = fs.readFileSync('src/pages/partner/tabs/ReservationsTab.tsx', 'utf-8');

const target = `<span className="font-bold text-slate-700">{booking.customer_profile?.full_name || 'Cliente Manual'}</span>`;
const replacement = `
<div className="flex flex-col">
  <span className="font-bold text-slate-700">{booking.customer?.full_name || booking.customer_profile?.full_name || booking.notes?.includes('Manual:') ? booking.notes.split(' ')[1] : 'Cliente Manual'}</span>
  <span className="text-[10px] text-slate-500 font-mono">{booking.customer?.email || booking.customer_profile?.email || 'Sem e-mail'}</span>
</div>
`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/partner/tabs/ReservationsTab.tsx', content);
