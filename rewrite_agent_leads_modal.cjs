const fs = require('fs');

const content = `import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Loader2, Phone, CheckCircle, Copy, Link as LinkIcon, Trash2 } from 'lucide-react';
import { SalesAgent } from '../types';

interface Lead {
  id: string;
  nome_loja: string;
  telefone: string;
  estado_chamada: string;
  sms_enviado: boolean;
  potencial_fecho: number;
  notas: string;
}

export default function AgentLeadsModal({ agent, onClose }: { agent: SalesAgent, onClose: () => void }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [agent.id]);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('vendedor_id', agent.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePendingLeads = async () => {
    if (!confirm('Tem a certeza que deseja remover as leads pendentes deste comercial? Elas voltarão para o lote de distribuição.')) return;
    
    setRemoving(true);
    try {
      const { error } = await supabase
        .from('leads')
        .update({ vendedor_id: null, senha_acesso: null })
        .eq('vendedor_id', agent.id)
        .eq('estado_chamada', 'pendente');
        
      if (error) throw error;
      
      // Update local state
      setLeads(leads.filter(l => l.estado_chamada !== 'pendente'));
      alert('Leads pendentes removidas com sucesso.');
    } catch (err) {
      console.error(err);
      alert('Erro ao remover leads.');
    } finally {
      setRemoving(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'pendente': return 'A Contactar';
      case 'contactado': return 'Contactado';
      case 'nao_atendeu': return 'Não Atendeu';
      case 'desligou': return 'Desligou Chamada';
      case 'nao_contactar': return 'Não Contactar Mais';
      case 'recusou': return 'Recusou';
      case 'fechou_pro': return 'Fechou (PRO)';
      case 'fechou_terminal': return 'Fechou (Terminal)';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pendente': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'contactado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'nao_atendeu': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'desligou': return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'nao_contactar': return 'bg-slate-800 text-white border-slate-900';
      case 'recusou': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'fechou_pro': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'fechou_terminal': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const pendentes = leads.filter(l => l.estado_chamada === 'pendente');
  const contactados = leads.filter(l => l.estado_chamada !== 'pendente');

  const copyLink = () => {
    const link = \`\${window.location.origin}/chamadas/\${agent.id}\`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
              Leads Atribuídas
            </h3>
            <p className="text-sm text-slate-500 font-medium">Comercial: <span className="font-bold text-slate-900">{agent.name}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 bg-slate-50 border-b border-slate-100">
           <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
             <div>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Link de Trabalho do Comercial</p>
               <div className="flex items-center gap-2">
                 <code className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm text-blue-600 font-mono">
                   {window.location.origin}/chamadas/{agent.id}
                 </code>
                 <button onClick={copyLink} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                   {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                 </button>
               </div>
             </div>
             
             <div className="flex flex-wrap items-center gap-4">
               {pendentes.length > 0 && (
                 <button
                   onClick={handleRemovePendingLeads}
                   disabled={removing}
                   className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 border border-rose-100"
                 >
                   {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                   Remover Pendentes
                 </button>
               )}
               <div className="text-center px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                 <span className="block text-2xl font-black text-amber-600">{pendentes.length}</span>
                 <span className="text-[10px] uppercase font-bold text-slate-400">Pendentes</span>
               </div>
               <div className="text-center px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                 <span className="block text-2xl font-black text-emerald-600">{contactados.length}</span>
                 <span className="text-[10px] uppercase font-bold text-slate-400">Contactados</span>
               </div>
             </div>
           </div>
        </div>

        <div className="p-0 overflow-y-auto flex-1">
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Phone className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p>Nenhuma lead atribuída a este comercial.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="p-4">Loja</th>
                  <th className="p-4">Telefone</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-center">Potencial</th>
                  <th className="p-4">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">{lead.nome_loja}</td>
                    <td className="p-4 font-mono text-slate-600">{lead.telefone}</td>
                    <td className="p-4">
                      <span className={\`px-2 py-1 rounded-full text-[10px] font-bold border \${getStatusColor(lead.estado_chamada)}\`}>
                        {getStatusLabel(lead.estado_chamada)}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-slate-700">
                      {lead.estado_chamada !== 'pendente' ? lead.potencial_fecho : '-'}
                    </td>
                    <td className="p-4 text-xs text-slate-500 truncate max-w-[150px]">
                      {lead.notas || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
`

fs.writeFileSync('src/components/AgentLeadsModal.tsx', content);
