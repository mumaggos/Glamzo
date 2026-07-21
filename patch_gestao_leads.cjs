const fs = require('fs');
let content = fs.readFileSync('src/components/GestaoLeads.tsx', 'utf8');

// We need to add leads state
content = content.replace(
  /const \[availableLeads, setAvailableLeads\] = useState<number>\(0\);/,
  `const [availableLeads, setAvailableLeads] = useState<number>(0);
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [leadsFilter, setLeadsFilter] = useState<'livres' | 'atribuidas' | 'usadas'>('usadas');`
);

content = content.replace(
  /const fetchAvailableLeads = async \(\) => \{[\s\S]*?\}\s*catch \(err\) \{[\s\S]*?\}\s*\};/,
  `const fetchAvailableLeads = async () => {
    try {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .is('vendedor_id', null)
        .eq('estado_chamada', 'pendente');
        
      if (count !== null) {
        setAvailableLeads(count);
      }

      const { data } = await supabase
        .from('leads')
        .select('*, vendedor:sales_agents(name)')
        .order('created_at', { ascending: false });
        
      if (data) setAllLeads(data);
    } catch (err) {
      console.error('Error fetching leads:', err);
    }
  };`
);

content = content.replace(
  /(\s*)<\/div>\s*<\/div>\s*\)\;\s*\}\s*$/,
  `$1
      {/* Global Leads List */}
      <div className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-extrabold text-slate-900">Base de Dados de Leads</h3>
            <p className="text-xs text-slate-500">Registo global de todas as leads inseridas no sistema.</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setLeadsFilter('livres')}
              className={\`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors \${leadsFilter === 'livres' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}\`}
            >
              Livres
            </button>
            <button
              onClick={() => setLeadsFilter('atribuidas')}
              className={\`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors \${leadsFilter === 'atribuidas' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}\`}
            >
              Atribuídas
            </button>
            <button
              onClick={() => setLeadsFilter('usadas')}
              className={\`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors \${leadsFilter === 'usadas' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}\`}
            >
              Usadas / Histórico
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0">
              <tr>
                <th className="p-4">Loja</th>
                <th className="p-4">Telefone</th>
                <th className="p-4">Comercial</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Potencial</th>
                <th className="p-4">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allLeads.filter(l => {
                if (leadsFilter === 'livres') return !l.vendedor_id && l.estado_chamada === 'pendente';
                if (leadsFilter === 'atribuidas') return l.vendedor_id && l.estado_chamada === 'pendente';
                if (leadsFilter === 'usadas') return l.estado_chamada !== 'pendente';
                return true;
              }).map(lead => (
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
              {allLeads.filter(l => {
                if (leadsFilter === 'livres') return !l.vendedor_id && l.estado_chamada === 'pendente';
                if (leadsFilter === 'atribuidas') return l.vendedor_id && l.estado_chamada === 'pendente';
                if (leadsFilter === 'usadas') return l.estado_chamada !== 'pendente';
                return true;
              }).length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Nenhuma lead encontrada neste estado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`
);

fs.writeFileSync('src/components/GestaoLeads.tsx', content);
