const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/ReservationsTab.tsx', 'utf8');

const thStart = /<th className="px-6 py-4">Profissional<\/th>/;
const thNew = `<th className="px-6 py-4">Profissional</th>
                <th className="px-6 py-4 text-center">Estado</th>`;
content = content.replace(thStart, thNew);

const tdStart = /<td className="px-6 py-4 font-bold text-slate-700">\{booking\.staff\?\.full_name \|\| '-'}<\/td>/;
const tdNew = `<td className="px-6 py-4 font-bold text-slate-700">{booking.staff?.full_name || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={\`text-[10px] font-bold px-2 py-1 rounded-full uppercase \${
                       booking.booking_status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                       booking.booking_status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                       booking.booking_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                       'bg-purple-100 text-purple-700'
                    }\`}>
                      {booking.booking_status === 'completed' ? 'Concluído' :
                       booking.booking_status === 'cancelled' ? 'Cancelado' :
                       booking.booking_status === 'pending' ? 'Pendente' :
                       'Confirmado'}
                    </span>
                  </td>`;
content = content.replace(tdStart, tdNew);

fs.writeFileSync('src/pages/partner/tabs/ReservationsTab.tsx', content);
