import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Plus, Copy, Check, Users, Target, Link as LinkIcon, BadgeEuro, X } from 'lucide-react';
import { SalesAgent } from '../types';

export default function SalesAgentsTab() {
  const [agents, setAgents] = useState<SalesAgent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [creating, setCreating] = useState(false);
  
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Empty teams stored in state (to allow creating teams before adding agents)
  const [emptyTeams, setEmptyTeams] = useState<string[]>([]);
  
  // Performance metrics state
  const [performance, setPerformance] = useState<Record<string, { totalStores: number, proStores: number, terminalStores: number, totalCommission: number }>>({});

  useEffect(() => {
    fetchAgents();
    const stored = localStorage.getItem('glamzo_sales_teams');
    if (stored) {
      setEmptyTeams(JSON.parse(stored));
    }
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
            
            let commission = 2; 
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

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    
    const updated = [...new Set([...emptyTeams, newTeamName.trim()])];
    setEmptyTeams(updated);
    localStorage.setItem('glamzo_sales_teams', JSON.stringify(updated));
    setNewTeamName('');
    setShowTeamModal(false);
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
        team_name: selectedTeam || 'Sem Equipa',
        ref_code: generateRefCode(formData.name)
      };

      const { data, error } = await supabase
        .from('sales_agents')
        .insert(newAgent)
        .select()
        .single();

      if (error) throw error;
      setAgents([data, ...agents]);
      setShowAgentModal(false);
      setFormData({ name: '', phone: '' });
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Erro ao gerar link de comercial.');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (code: string, id: string) => {
    const url = `${window.location.origin}/partner?ref=${code}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Extract all unique teams
  const allTeams = Array.from(new Set([
    ...agents.map(a => a.team_name).filter(Boolean),
    ...emptyTeams
  ])) as string[];

  // Also include "Sem Equipa" if any agents have no team
  const agentsWithoutTeam = agents.filter(a => !a.team_name || a.team_name === 'Sem Equipa');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Equipas de Vendas</h3>
          <p className="text-xs text-slate-600 mt-0.5">Crie equipas e adicione comerciais para monitorizar as inscrições.</p>
        </div>
        <button
          onClick={() => setShowTeamModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Criar Equipa
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="space-y-8">
          {allTeams.length === 0 && agentsWithoutTeam.length === 0 && (
            <div className="text-center p-12 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Nenhuma equipa registada.</p>
            </div>
          )}

          {allTeams.map((teamName) => {
            const teamAgents = agents.filter(a => a.team_name === teamName);
            return (
              <div key={teamName} className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h4 className="font-extrabold text-lg text-slate-900">{teamName}</h4>
                  <button
                    onClick={() => {
                      setSelectedTeam(teamName);
                      setShowAgentModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Comercial
                  </button>
                </div>
                
                {teamAgents.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    Nenhum comercial nesta equipa.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="p-4">Comercial</th>
                          <th className="p-4 text-center">Cliques</th>
                          <th className="p-4 text-center">Lojas</th>
                          <th className="p-4 text-center">Pro</th>
                          <th className="p-4 text-center">Terminal</th>
                          <th className="p-4 text-right">Faturado</th>
                          <th className="p-4 text-right">Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {teamAgents.map(agent => {
                          const perf = performance[agent.id] || { totalStores: 0, proStores: 0, terminalStores: 0, totalCommission: 0 };
                          return (
                            <tr key={agent.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 font-bold text-slate-900">{agent.name}</td>
                              <td className="p-4 text-center font-bold text-blue-600">{agent.clicks_count}</td>
                              <td className="p-4 text-center font-bold text-slate-700">{perf.totalStores}</td>
                              <td className="p-4 text-center font-bold text-slate-700">{perf.proStores}</td>
                              <td className="p-4 text-center font-bold text-slate-700">{perf.terminalStores}</td>
                              <td className="p-4 text-right font-black text-emerald-600">{perf.totalCommission.toFixed(2)} €</td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => copyToClipboard(agent.ref_code, agent.id)}
                                  className="inline-flex items-center justify-center w-7 h-7 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                                  title="Copiar Link de Afiliado"
                                >
                                  {copiedId === agent.id ? <Check className="w-3 h-3 text-emerald-600" /> : <LinkIcon className="w-3 h-3" />}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Render agents without team if any */}
          {agentsWithoutTeam.length > 0 && (
            <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h4 className="font-extrabold text-lg text-slate-600">Sem Equipa</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {agentsWithoutTeam.map(agent => {
                      const perf = performance[agent.id] || { totalStores: 0, proStores: 0, terminalStores: 0, totalCommission: 0 };
                      return (
                        <tr key={agent.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-slate-900">{agent.name}</td>
                          <td className="p-4 text-center font-bold text-blue-600">{agent.clicks_count}</td>
                          <td className="p-4 text-center font-bold text-slate-700">{perf.totalStores}</td>
                          <td className="p-4 text-center font-bold text-slate-700">{perf.proStores}</td>
                          <td className="p-4 text-center font-bold text-slate-700">{perf.terminalStores}</td>
                          <td className="p-4 text-right font-black text-emerald-600">{perf.totalCommission.toFixed(2)} €</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => copyToClipboard(agent.ref_code, agent.id)}
                              className="inline-flex items-center justify-center w-7 h-7 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                            >
                              {copiedId === agent.id ? <Check className="w-3 h-3 text-emerald-600" /> : <LinkIcon className="w-3 h-3" />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL CRIAR EQUIPA */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-900">Nova Equipa</h3>
              <button onClick={() => setShowTeamModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTeam} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Nome da Equipa</label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-bold"
                  placeholder="Ex: Equipa Norte"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors flex justify-center"
              >
                Criar Equipa
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CRIAR COMERCIAL */}
      {showAgentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-900">Novo Comercial em "{selectedTeam}"</h3>
              <button onClick={() => setShowAgentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAgent} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-bold"
                  placeholder="Ex: João Silva"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Telemóvel (Opcional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-medium"
                  placeholder="Ex: 912345678"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-black transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                Gerar Link Único
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
