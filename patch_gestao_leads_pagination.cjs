const fs = require('fs');
let content = fs.readFileSync('src/components/GestaoLeads.tsx', 'utf8');

// Add states
content = content.replace(
  /const \[leadsFilter, setLeadsFilter\] = useState<'livres' \| 'atribuidas' \| 'usadas'>\('usadas'\);/,
  `const [leadsFilter, setLeadsFilter] = useState<'livres' | 'atribuidas' | 'usadas'>('usadas');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;`
);

// Reset page on filter change
content = content.replace(
  /onClick=\{\(\) => setLeadsFilter\('livres'\)\}/,
  `onClick={() => { setLeadsFilter('livres'); setCurrentPage(1); }}`
);
content = content.replace(
  /onClick=\{\(\) => setLeadsFilter\('atribuidas'\)\}/,
  `onClick={() => { setLeadsFilter('atribuidas'); setCurrentPage(1); }}`
);
content = content.replace(
  /onClick=\{\(\) => setLeadsFilter\('usadas'\)\}/,
  `onClick={() => { setLeadsFilter('usadas'); setCurrentPage(1); }}`
);

// Add Chevron imports
content = content.replace(
  /import \{ Upload, Users, Key, Link as LinkIcon, Check, Loader2, AlertCircle \} from 'lucide-react';/,
  `import { Upload, Users, Key, Link as LinkIcon, Check, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';`
);

// Update rendering of table body to use slice and add pagination controls
const renderLogic = `
            <tbody className="divide-y divide-slate-100">
              {(() => {
                const filtered = allLeads.filter(l => {
                  if (leadsFilter === 'livres') return !l.vendedor_id && l.estado_chamada === 'pendente';
                  if (leadsFilter === 'atribuidas') return l.vendedor_id && l.estado_chamada === 'pendente';
                  if (leadsFilter === 'usadas') return l.estado_chamada !== 'pendente';
                  return true;
                });
                
                const totalPages = Math.ceil(filtered.length / itemsPerPage);
                const displayed = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                
                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">Nenhuma lead encontrada neste estado.</td>
                    </tr>
                  );
                }
                
                return (
                  <>
                    {displayed.map(lead => (
                      <tr key={lead.id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900">{lead.nome_loja}</td>
                        <td className="p-4 font-mono text-slate-600">{lead.telefone}</td>
                        <td className="p-4 font-medium text-slate-700">
                          {lead.vendedor_id ? (lead.vendedor?.name || 'Comercial Apagado') : '-'}
                        </td>
                        <td className="p-4">
                          <span className={\`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider \${
                            lead.estado_chamada === 'pendente' ? 'bg-amber-100 text-amber-700' :
                            lead.estado_chamada === 'fechou_pro' ? 'bg-emerald-100 text-emerald-700' :
                            lead.estado_chamada === 'fechou_terminal' ? 'bg-purple-100 text-purple-700' :
                            'bg-slate-100 text-slate-600'
                          }\`}>
                            {lead.estado_chamada.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold text-slate-700">{lead.estado_chamada !== 'pendente' ? lead.potencial_fecho : '-'}</td>
                        <td className="p-4 text-xs text-slate-500 max-w-[200px] truncate" title={lead.notas}>{lead.notas || '-'}</td>
                      </tr>
                    ))}
                  </>
                );
              })()}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        {(() => {
          const filteredCount = allLeads.filter(l => {
            if (leadsFilter === 'livres') return !l.vendedor_id && l.estado_chamada === 'pendente';
            if (leadsFilter === 'atribuidas') return l.vendedor_id && l.estado_chamada === 'pendente';
            if (leadsFilter === 'usadas') return l.estado_chamada !== 'pendente';
            return true;
          }).length;
          const totalPages = Math.ceil(filteredCount / itemsPerPage);
          
          if (totalPages <= 1) return null;
          
          return (
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between rounded-b-3xl">
              <span className="text-xs text-slate-500 font-medium">
                A mostrar {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredCount)} de {filteredCount} leads
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-700">Pág. {currentPage} de {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}`;

content = content.replace(
  /<tbody className="divide-y divide-slate-100">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\)\;\s*\}\s*$/,
  renderLogic + '\n}\n'
);

fs.writeFileSync('src/components/GestaoLeads.tsx', content);
