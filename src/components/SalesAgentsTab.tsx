import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Plus, Copy, Check, Users, Target, Link as LinkIcon, BadgeEuro } from 'lucide-react';
import { SalesAgent } from '../types';

export default function SalesAgentsTab() {
  const [agents, setAgents] = useState<SalesAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', team_name: '' });
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Performance metrics state
  const [performance, setPerformance] = useState<Record<string, { totalStores: number, proStores: number, terminalStores: number, totalCommission: number }>>({});

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const { data: agentsData, error: agentsError } = await supabase
        .from('sales_agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (agentsError) throw agentsError;

      setAgents(agentsData || []);

      // Now fetch businesses to calculate performance
      // Only fetch businesses that have an agent_id
      const { data: businessesData, error: businessesError } = await supabase
        .from('businesses')
        .select('agent_id, active_plan');
        
      if (!businessesError && businessesData) {
        const perfData: Record<string, any> = {};
        
        agentsData?.forEach(agent => {
          perfData[agent.id] = { totalStores: 0, proStores: 0, terminalStores: 0, totalCommission: 0 };
        });

        businessesData.forEach(business => {
          if (business.agent_id && perfData[business.agent_id]) {
            const p = perfData[business.agent_id];
            p.totalStores += 1;
            
            // Lógica de Comissões (Exemplo):
            // Assumimos:
            // "free" ou sem plano: 2€ (ou 0€? O utilizador disse "Lojas Teste * 2€") -> assumimos 2€ para todos
            // "pro": 2.50€
            // "pro_terminal" (ou algo similar, vamos usar "terminal" se for assim): 5.0€
            let commission = 2; // base / teste
            
            if (business.active_plan === 'pro') {
              p.proStores += 1;
              commission = 2.5;
            } else if (business.active_plan === 'pro_terminal' || business.active_plan?.includes('terminal')) {
              p.terminalStores += 1;
              commission = 5;
            }
            
            p.totalCommission += commission;
          }
        });
        
        setPerformance(perfData);
      }
      
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRefCode = (name: string) => {
    const base = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${base}-${randomSuffix}`;
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    try {
      setCreating(true);
      
      const newAgent = {
        name: formData.name,
        phone: formData.phone || null,
        team_name: formData.team_name || null,
        ref_code: generateRefCode(formData.name)
      };

      const { data, error } = await supabase
        .from('sales_agents')
        .insert([newAgent])
        .select()
        .single();

      if (error) throw error;
      
      setAgents([data, ...agents]);
      setShowModal(false);
      setFormData({ name: '', phone: '', team_name: '' });
      
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Erro ao criar agente.');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (refCode: string, id: string) => {
    const url = `${window.location.origin}/partner/signup?ref=${refCode}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Equipas de Vendas e Afiliados</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Gira comerciais, links de afiliados e comissões.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Comercial
        </button>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Comercial / Equipa</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Cliques no Link</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Cadastros (Lojas)</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Assinaturas Pro</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Pro Terminal</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total Faturado</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
                  </td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                    Nenhum comercial registado.
                  </td>
                </tr>
              ) : (
                agents.map((agent) => {
                  const perf = performance[agent.id] || { totalStores: 0, proStores: 0, terminalStores: 0, totalCommission: 0 };
                  return (
                    <tr key={agent.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{agent.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3" />
                          {agent.team_name || 'Sem Equipa'}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                          <Target className="w-3 h-3" />
                          {agent.clicks_count}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-700">
                        {perf.totalStores}
                      </td>
                      <td className="p-4 text-center font-bold text-slate-700">
                        {perf.proStores}
                      </td>
                      <td className="p-4 text-center font-bold text-slate-700">
                        {perf.terminalStores}
                      </td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-black">
                          <BadgeEuro className="w-4 h-4" />
                          {perf.totalCommission.toFixed(2)} €
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => copyToClipboard(agent.ref_code, agent.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                          title="Copiar Link de Afiliado"
                        >
                          {copiedId === agent.id ? <Check className="w-4 h-4 text-emerald-600" /> : <LinkIcon className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Novo Comercial</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <Copy className="w-5 h-5 hidden" /> {/* just placeholder to align, we'll use a simple close X or word Cancelar later */}
                <span className="text-xs font-bold uppercase">Fechar</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateAgent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Nome do Comercial *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-medium"
                  placeholder="Ex: João Silva"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Telemóvel</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-medium"
                  placeholder="Ex: 912345678"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Equipa</label>
                <input
                  type="text"
                  value={formData.team_name}
                  onChange={e => setFormData({ ...formData, team_name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-medium"
                  placeholder="Ex: Equipa Norte"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-black transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                  Gerar Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
