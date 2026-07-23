import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Plus, Copy, Check, Users, Target, Link as LinkIcon, BadgeEuro, X, Trash2 } from 'lucide-react';
import { SalesAgent } from '../types';
import { Phone } from 'lucide-react';
import GestaoLeads from './GestaoLeads';
import AgentLeadsModal from './AgentLeadsModal';
import AgentStoresModal from './AgentStoresModal';
import { useTranslation } from "react-i18next";

export default function SalesAgentsTab() {
    const { t } = useTranslation();
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
  const [viewAgentLeads, setViewAgentLeads] = useState<SalesAgent | null>(null);
  const [viewAgentStores, setViewAgentStores] = useState<SalesAgent | null>(null);
  
  // Performance metrics state
  const [performance, setPerformance] = useState<Record<string, { totalStores: number, proStores: number, terminalStores: number, totalCommission: number, assignedLeads: number, contactedLeads: number }>>({});

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
        .select('agent_id, selected_plan, tablet_requested');
        
      if (!businessesError && businessesData) {
        const perfData: Record<string, any> = {};
        
        agentsData?.forEach(agent => {
          perfData[agent.id] = { totalStores: 0, proStores: 0, terminalStores: 0, totalCommission: 0, assignedLeads: 0, contactedLeads: 0 };
        });

        businessesData.forEach(business => {
          if (business.agent_id && perfData[business.agent_id]) {
            const p = perfData[business.agent_id];
            p.totalStores += 1;
            
            let commission = 0; 
            if (business.selected_plan === 'app_tablet' || business.selected_plan === 'pro_terminal' || business.selected_plan?.includes('terminal') || business.tablet_requested) {
              p.terminalStores += 1;
              commission = 5;
            } else if (business.selected_plan === 'app' || business.selected_plan === 'pro' || business.selected_plan?.includes('pro') || business.selected_plan === 'monthly' || business.selected_plan === 'yearly') {
              p.proStores += 1;
              commission = 2.5;
            }
            
            p.totalCommission += commission;
          }
        });
        
        
        // Fetch leads statistics
        const { data: leadsData } = await supabase.from('leads').select('vendedor_id, estado_chamada').not('vendedor_id', 'is', null);
        if (leadsData) {
          leadsData.forEach(lead => {
            if (perfData[lead.vendedor_id]) {
              perfData[lead.vendedor_id].assignedLeads++;
            }
          });
        }

        const { data: logsData } = await supabase.from('call_logs').select('agent_id');
        if (logsData) {
          logsData.forEach(log => {
            if (perfData[log.agent_id]) {
              perfData[log.agent_id].contactedLeads++;
            }
          });
        }
        
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

  const handleDeleteTeam = (teamName: string) => {
    if (confirm(`Tem a certeza que deseja apagar a equipa "${teamName}"?`)) {
      const teamAgents = agents.filter(a => a.team_name === teamName);
      if (teamAgents.length > 0) {
        alert('Não é possível apagar uma equipa que contenha comerciais.');
        return;
      }
      const updated = emptyTeams.filter(t => t !== teamName);
      setEmptyTeams(updated);
      localStorage.setItem('glamzo_sales_teams', JSON.stringify(updated));
    }
  };

  const handleDeleteAgent = async (agentId: string, agentName: string) => {
    if (confirm(`Tem a certeza que deseja apagar o comercial "${agentName}"? As leads pendentes voltarão para distribuição.`)) {
      try {
        // Unassign pending leads
        await supabase
          .from('leads')
          .update({ vendedor_id: null, senha_acesso: null })
          .eq('vendedor_id', agentId)
          .eq('estado_chamada', 'pendente');
          
        const { error } = await supabase.from('sales_agents').delete().eq('id', agentId);
        if (error) throw error;
        setAgents(agents.filter(a => a.id !== agentId));
      } catch (err) {
        console.error(err);
        alert('Erro ao apagar comercial.');
      }
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
      <GestaoLeads agents={agents} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 pt-8">
        <div>
          <h3 className="text-xl font-extrabold tracking-tight text-slate-900">{t('txt_equipas_de_vendas') || 'Equipas de Vendas'}</h3>
          <p className="text-xs text-slate-600 mt-0.5">{t('txt_crie_equipas_e_adicione_comerc') || 'Crie equipas e adicione comerciais para monitorizar as inscrições.'}</p>
        </div>
        <button
          onClick={() => setShowTeamModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          
                            {t('txt_criar_equipa') || 'Criar Equipa'}
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
              <p className="text-slate-500 font-medium">{t('txt_nenhuma_equipa_registada') || 'Nenhuma equipa registada.'}</p>
            </div>
          )}

          {allTeams.map((teamName) => {
            const teamAgents = agents.filter(a => a.team_name === teamName);
            return (
              <div key={teamName} className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
    <h4 className="font-extrabold text-lg text-slate-900">{teamName}</h4>
    {teamAgents.length === 0 && (
      <button onClick={() => handleDeleteTeam(teamName)} className="text-slate-300 hover:text-rose-500 transition-colors" title={t('txt_apagar_equipa_vazia') || 'Apagar Equipa Vazia'}>
        <Trash2 className="w-4 h-4" />
      </button>
    )}
  </div>
                  <button
                    onClick={() => {
                      setSelectedTeam(teamName);
                      setShowAgentModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />  {t('txt_adicionar_comercial') || 'Adicionar Comercial'}
                                              </button>
                </div>
                
                {teamAgents.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">
                    
                                                {t('txt_nenhum_comercial_nesta_equipa') || 'Nenhum comercial nesta equipa.'}
                                              </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="p-4">{t('txt_comercial_46') || 'Comercial'}</th>
                          <th className="p-4 text-center">{t('txt_cliques_47') || 'Cliques'}</th>
                          <th className="p-4 text-center">{t('txt_leads_crm') || 'Leads CRM'}</th>
                          <th className="p-4 text-center">{t('txt_inscri_es') || 'Inscrições'}</th>
                          <th className="p-4 text-center">{t('txt_plano_pro') || 'Plano PRO'}</th>
                          <th className="p-4 text-center">{t('txt_pro_terminal') || 'PRO + Terminal'}</th>
                          <th className="p-4 text-right">{t('txt_faturado_48') || 'Faturado'}</th>
                          <th className="p-4 text-right">{t('txt_link_49') || 'Link'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {teamAgents.map(agent => {
                          const perf = performance[agent.id] || { totalStores: 0, proStores: 0, terminalStores: 0, totalCommission: 0, assignedLeads: 0, contactedLeads: 0 };
                          return (
                            <tr key={agent.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 font-bold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setViewAgentLeads(agent)} title={t('txt_ver_leads_atribu_das') || 'Ver Leads Atribuídas'}>
                                {agent.name}
                              </td>
                              <td className="p-4 text-center font-bold text-blue-600">
    <div className="flex flex-col items-center">
      <span>{agent.clicks_count}</span>
      <span className="text-[9px] text-slate-400 font-normal">cliques</span>
    </div>
  </td>
                              <td className="p-4 text-center font-bold text-slate-700 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setViewAgentLeads(agent)}>
     <div className="flex flex-col items-center">
       <span>{perf.assignedLeads}</span>
       <span className="text-[9px] text-emerald-600">{perf.contactedLeads}  {t('txt_cont') || 'cont.'}</span>
     </div>
   </td>
   <td className="p-4 text-center font-bold text-slate-700 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setViewAgentStores(agent)} title={t('txt_ver_lojas') || 'Ver Lojas'}>{perf.totalStores}</td>
                              <td className="p-4 text-center font-bold text-slate-700 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setViewAgentStores(agent)} title={t('txt_ver_lojas') || 'Ver Lojas'}>{perf.proStores}</td>
                              <td className="p-4 text-center font-bold text-slate-700 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setViewAgentStores(agent)} title={t('txt_ver_lojas') || 'Ver Lojas'}>{perf.terminalStores}</td>
                              <td className="p-4 text-right font-black text-emerald-600">{perf.totalCommission.toFixed(2)} €</td>
                              <td className="p-4 text-right">
                                <button
    onClick={() => copyToClipboard(agent.ref_code, agent.id)}
    className="inline-flex items-center justify-center w-7 h-7 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
    title={t('txt_copiar_link_de_afiliado') || 'Copiar Link de Afiliado'}
  >
    {copiedId === agent.id ? <Check className="w-3 h-3 text-emerald-600" /> : <LinkIcon className="w-3 h-3" />}
  </button>
  <button
    onClick={() => {
      const link = `${window.location.origin}/chamadas/${agent.id}`;
      navigator.clipboard.writeText(link);
      setCopiedId('crm_' + agent.id);
      setTimeout(() => setCopiedId(null), 2000);
    }}
    className="inline-flex items-center justify-center w-7 h-7 ml-2 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
    title={t('txt_copiar_link_do_crm_de_chamadas') || 'Copiar Link do CRM de Chamadas'}
  >
    {copiedId === 'crm_' + agent.id ? <Check className="w-3 h-3 text-blue-600" /> : <Phone className="w-3 h-3" />}
  </button>
                                <button
                                  onClick={() => handleDeleteAgent(agent.id, agent.name)}
                                  className="inline-flex items-center justify-center w-7 h-7 ml-2 rounded bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                                  title={t('txt_apagar_comercial') || 'Apagar Comercial'}
                                >
                                  <Trash2 className="w-3 h-3" />
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
                <h4 className="font-extrabold text-lg text-slate-600">{t('txt_sem_equipa') || 'Sem Equipa'}</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {agentsWithoutTeam.map(agent => {
                      const perf = performance[agent.id] || { totalStores: 0, proStores: 0, terminalStores: 0, totalCommission: 0, assignedLeads: 0, contactedLeads: 0 };
                      return (
                        <tr key={agent.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setViewAgentLeads(agent)} title={t('txt_ver_leads_atribu_das') || 'Ver Leads Atribuídas'}>
                                {agent.name}
                              </td>
                              <td className="p-4 text-center font-bold text-blue-600">
    <div className="flex flex-col items-center">
      <span>{agent.clicks_count}</span>
      <span className="text-[9px] text-slate-400 font-normal">cliques</span>
    </div>
  </td>
                              <td className="p-4 text-center font-bold text-slate-700 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setViewAgentLeads(agent)}>
     <div className="flex flex-col items-center">
       <span>{perf.assignedLeads}</span>
       <span className="text-[9px] text-emerald-600">{perf.contactedLeads}  {t('txt_cont') || 'cont.'}</span>
     </div>
   </td>
   <td className="p-4 text-center font-bold text-slate-700 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setViewAgentStores(agent)} title={t('txt_ver_lojas') || 'Ver Lojas'}>{perf.totalStores}</td>
                              <td className="p-4 text-center font-bold text-slate-700 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setViewAgentStores(agent)} title={t('txt_ver_lojas') || 'Ver Lojas'}>{perf.proStores}</td>
                              <td className="p-4 text-center font-bold text-slate-700 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => setViewAgentStores(agent)} title={t('txt_ver_lojas') || 'Ver Lojas'}>{perf.terminalStores}</td>
                              <td className="p-4 text-right font-black text-emerald-600">{perf.totalCommission.toFixed(2)} €</td>
                              <td className="p-4 text-right">
                            <button
    onClick={() => copyToClipboard(agent.ref_code, agent.id)}
    className="inline-flex items-center justify-center w-7 h-7 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
    title={t('txt_copiar_link_de_afiliado') || 'Copiar Link de Afiliado'}
  >
    {copiedId === agent.id ? <Check className="w-3 h-3 text-emerald-600" /> : <LinkIcon className="w-3 h-3" />}
  </button>
  <button
    onClick={() => {
      const link = `${window.location.origin}/chamadas/${agent.id}`;
      navigator.clipboard.writeText(link);
      setCopiedId('crm_' + agent.id);
      setTimeout(() => setCopiedId(null), 2000);
    }}
    className="inline-flex items-center justify-center w-7 h-7 ml-2 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
    title={t('txt_copiar_link_do_crm_de_chamadas') || 'Copiar Link do CRM de Chamadas'}
  >
    {copiedId === 'crm_' + agent.id ? <Check className="w-3 h-3 text-blue-600" /> : <Phone className="w-3 h-3" />}
  </button>
                            <button
                              onClick={() => handleDeleteAgent(agent.id, agent.name)}
                              className="inline-flex items-center justify-center w-7 h-7 ml-2 rounded bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                              title={t('txt_apagar_comercial') || 'Apagar Comercial'}
                            >
                              <Trash2 className="w-3 h-3" />
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
              <h3 className="text-lg font-black text-slate-900">{t('txt_nova_equipa') || 'Nova Equipa'}</h3>
              <button onClick={() => setShowTeamModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTeam} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">{t('txt_nome_da_equipa') || 'Nome da Equipa'}</label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-bold"
                  placeholder={t('txt_ex_equipa_norte') || 'Ex: Equipa Norte'}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors flex justify-center"
              >
                
                                              {t('txt_criar_equipa') || 'Criar Equipa'}
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
              <h3 className="text-lg font-black text-slate-900">{t('txt_novo_comercial_em') || 'Novo Comercial em "'}{selectedTeam}"</h3>
              <button onClick={() => setShowAgentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAgent} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">{t('txt_nome_completo') || 'Nome Completo'}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-bold"
                  placeholder={t('txt_ex_jo_o_silva') || 'Ex: João Silva'}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">{t('txt_telem_vel_opcional') || 'Telemóvel (Opcional)'}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-medium"
                  placeholder={t('txt_ex_912345678') || 'Ex: 912345678'}
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-black transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                
                                              {t('txt_gerar_link_nico') || 'Gerar Link Único'}
                                            </button>
            </form>
          </div>
        </div>
      )}
    
      {viewAgentStores && (
        <AgentStoresModal
          agent={viewAgentStores}
          onClose={() => setViewAgentStores(null)}
        />
      )}

      {viewAgentLeads && (
        <AgentLeadsModal agent={viewAgentLeads} onClose={() => setViewAgentLeads(null)} />
      )}
    </div>
  );
}
