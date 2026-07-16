const fs = require('fs');
let code = fs.readFileSync('src/components/ClientXRayModal.tsx', 'utf8');

const updatedTable = `
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0">
                      <tr>
                        <th className="py-3 px-4">Loja & Serviço</th>
                        <th className="py-3 px-4">Data e Hora</th>
                        <th className="py-3 px-4">Valor</th>
                        <th className="py-3 px-4 text-center">Pontos</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {bookings.map((bk) => (
                        <tr key={bk.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">{bk.business?.name || 'Loja Indisponível'}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{bk.service?.name || 'Serviço Indisponível'}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-slate-700">{new Date(bk.booking_date).toLocaleDateString('pt-PT')}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{bk.start_time?.substring(0, 5)} - {bk.end_time?.substring(0, 5)}</p>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-700">
                            {bk.service?.price ? \`\${bk.service.price}€\` : '-'}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-emerald-600">
                            {bk.points_awarded > 0 ? \`+\${bk.points_awarded}\` : '-'}
                          </td>
                          <td className="py-3 px-4 text-right">
`;

code = code.replace(/<table className="w-full text-left">[\s\S]*?<td className="py-3 px-4 text-right">/, updatedTable.trim() + '\n<td className="py-3 px-4 text-right">');

fs.writeFileSync('src/components/ClientXRayModal.tsx', code);
