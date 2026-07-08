const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/ReservationsTab.tsx', 'utf8');

const oldEmptyState = /  if \(!bookings \|\| bookings\.length === 0\) \{[\s\S]*?    \);\n  \}/;
content = content.replace(oldEmptyState, '');

const tableStart = /<div className="overflow-x-auto">/;
const newTableStart = `
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Sem reservas</h3>
            <p className="text-sm text-slate-500">Nenhuma marcação encontrada para este filtro.</p>
          </div>
        ) : (
        <div className="overflow-x-auto">`;

content = content.replace(tableStart, newTableStart);

const tableEnd = /<\/table>[\s\n]*<\/div>[\s\n]*<\/div>/;
const newTableEnd = `</table>\n        </div>\n        )}\n      </div>`;
content = content.replace(tableEnd, newTableEnd);

fs.writeFileSync('src/pages/partner/tabs/ReservationsTab.tsx', content);
