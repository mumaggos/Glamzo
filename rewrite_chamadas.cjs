const fs = require('fs');

const content = `import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Phone, CheckCircle, Clock, XCircle, AlertCircle, Save, Loader2, Search, ArrowRight, Lock, Key, ChevronLeft, ChevronRight } from 'lucide-react';

interface Lead {
  id: string;
  nome_loja: string;
  telefone: string;
  estado_chamada: string;
  sms_enviado: boolean;
  potencial_fecho: number;
  notas: string;
}

export default function ChamadasCRM() {
  const { vendedorId } = useParams<{ vendedorId: string }>();
  const [senha, setSenha] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pendentes' | 'contactados'>('pendentes');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Local edits before saving
  const [edits, setEdits] = useState<Record<string, Partial<Lead>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const storedAuth = sessionStorage.getItem(\`crm_auth_\${vendedorId}\`);
    if (storedAuth) {
      setSenha(storedAuth);
      validateAccess(storedAuth);
    }
  }, [vendedorId]);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const validateAccess = async (password: string) => {
    if (!vendedorId || !password) return;
    
    setAuthenticating(true);
    setAuthError('');
    
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id')
        .eq('vendedor_id', vendedorId)
        .eq('senha_acesso', password)
        .limit(1);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setAuthenticated(true);
        sessionStorage.setItem(\`crm_auth_\${vendedorId}\`, password);
        fetchLeads(password);
      } else {
        setAuthError('Senha incorreta ou nenhuma lead atribuída com esta senha.');
      }
    } catch (err: any) {
      console.error(err);
      setAuthError('Erro ao validar acesso.');
    } finally {
      setAuthenticating(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    validateAccess(senha);
  };

  const fetchLeads = async (password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('vendedor_id', vendedorId)
        .eq('senha_acesso', password)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string, field: keyof Lead, value: any) => {
    setEdits(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const saveLead = async (id: string) => {
    const updates = edits[id];
    if (!updates) return;

    setSavingId(id);
    
    // Auto-check SMS if nao_atendeu
    if (updates.estado_chamada === 'nao_atendeu' && updates.sms_enviado === undefined) {
      const lead = leads.find(l => l.id === id);
      if (lead && !lead.sms_enviado) {
        updates.sms_enviado = true;
      }
    }
    
    try {
      const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
      setEdits(prev => {
        const newEdits = { ...prev };
        delete newEdits[id];
        return newEdits;
      });
    } catch (err) {
      console.error('Error updating lead:', err);
      alert('Erro ao guardar alterações na lead.');
    } finally {
      setSavingId(null);
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

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-center text-slate-900 mb-2">Portal Comercial</h2>
          <p className="text-center text-sm text-slate-500 mb-8">Insira a sua senha de acesso ao lote de leads.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="Senha de Acesso"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
            
            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex gap-2 text-rose-700 text-xs font-bold items-center">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {authError}
              </div>
            )}
            
            <button
              type="submit"
              disabled={authenticating || !senha}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {authenticating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar no CRM'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filter based on tab and search
  // Combine edits with base leads for display
  const currentData = leads.map(l => ({ ...l, ...(edits[l.id] || {}) }));
  
  const pendentes = currentData.filter(l => l.estado_chamada === 'pendente' && (l.nome_loja.toLowerCase().includes(searchTerm.toLowerCase()) || l.telefone.includes(searchTerm)));
  const contactados = currentData.filter(l => l.estado_chamada !== 'pendente' && (l.nome_loja.toLowerCase().includes(searchTerm.toLowerCase()) || l.telefone.includes(searchTerm)));
  
  const activeList = activeTab === 'pendentes' ? pendentes : contactados;
  const totalPages = Math.ceil(activeList.length / itemsPerPage);
  const displayLeads = activeList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <h1 className="font-black text-slate-900 tracking-tight">CRM Vendas</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Pesquisar loja ou telemóvel..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64 text-slate-700"
              />
            </div>
            <button 
              onClick={() => {
                sessionStorage.removeItem(\`crm_auth_\${vendedorId}\`);
                setAuthenticated(false);
                setSenha('');
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-6">
          <button 
            onClick={() => setActiveTab('pendentes')}
            className={\`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 \${activeTab === 'pendentes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}
          >
            A Contactar
            <span className={\`px-2 py-0.5 rounded-full text-[10px] \${activeTab === 'pendentes' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}\`}>
              {leads.filter(l => (edits[l.id]?.estado_chamada || l.estado_chamada) === 'pendente').length}
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('contactados')}
            className={\`py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 \${activeTab === 'contactados' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}\`}
          >
            Já Contactados
            <span className={\`px-2 py-0.5 rounded-full text-[10px] \${activeTab === 'contactados' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}\`}>
              {leads.filter(l => (edits[l.id]?.estado_chamada || l.estado_chamada) !== 'pendente').length}
            </span>
          </button>
        </div>
      </header>
      
      {/* Search on mobile */}
      <div className="sm:hidden px-4 pt-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Pesquisar..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          />
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : activeList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <CheckCircle className="w-12 h-12 mb-4 text-slate-300" />
            <p className="font-medium">Nenhuma lead encontrada.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4 w-[20%]">Nome da Loja</th>
                    <th className="p-4 w-[12%]">Telefone</th>
                    <th className="p-4 w-[20%]">Estado</th>
                    <th className="p-4 w-[8%] text-center">SMS</th>
                    <th className="p-4 w-[10%] text-center">Potencial</th>
                    <th className="p-4">Notas</th>
                    <th className="p-4 w-[10%] text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {displayLeads.map(lead => {
                    const hasEdits = edits[lead.id] !== undefined;
                    const isSaving = savingId === lead.id;
                    return (
                      <tr key={lead.id} className={\`transition-colors \${hasEdits ? 'bg-blue-50/30' : 'hover:bg-slate-50'}\`}>
                        <td className="p-4 font-bold text-slate-900">
                          {lead.nome_loja}
                        </td>
                        <td className="p-4 font-mono font-medium text-slate-700">
                          <a href={\`tel:\${lead.telefone}\`} className="hover:text-blue-600 hover:underline">{lead.telefone}</a>
                        </td>
                        <td className="p-4">
                          <select
                            value={lead.estado_chamada}
                            onChange={(e) => handleEdit(lead.id, 'estado_chamada', e.target.value)}
                            className={\`w-full text-xs font-bold rounded-lg px-2 py-1.5 outline-none cursor-pointer border focus:ring-2 focus:ring-blue-500/30 \${getStatusColor(lead.estado_chamada)}\`}
                          >
                            <option value="pendente">A Contactar</option>
                            <option value="contactado">Contactado</option>
                            <option value="nao_atendeu">Não Atendeu (Avisa SMS)</option>
                            <option value="desligou">Desligou Chamada</option>
                            <option value="nao_contactar">Não Contactar Mais</option>
                            <option value="recusou">Recusou</option>
                            <option value="fechou_pro">Fechou PRO</option>
                            <option value="fechou_terminal">Fechou PRO+Terminal</option>
                          </select>
                        </td>
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={lead.sms_enviado}
                            onChange={(e) => handleEdit(lead.id, 'sms_enviado', e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={lead.potencial_fecho}
                              onChange={(e) => handleEdit(lead.id, 'potencial_fecho', parseInt(e.target.value) || 0)}
                              className="w-16 text-center text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-blue-500 focus:bg-white"
                            />
                          </div>
                        </td>
                        <td className="p-4">
                          <input
                            type="text"
                            value={lead.notas || ''}
                            onChange={(e) => handleEdit(lead.id, 'notas', e.target.value)}
                            placeholder="Notas da chamada..."
                            className="w-full text-xs bg-transparent border-none px-2 py-1.5 text-slate-700 outline-none focus:bg-slate-50 focus:ring-1 focus:ring-slate-200 rounded-lg transition-colors placeholder:text-slate-300"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => saveLead(lead.id)}
                            disabled={!hasEdits || isSaving}
                            className={\`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 mx-auto transition-colors \${
                              hasEdits 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'bg-slate-100 text-slate-400'
                            }\`}
                          >
                            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            {isSaving ? 'A Guardar' : 'Guardar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  A mostrar {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, activeList.length)} de {activeList.length} leads
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
            )}
          </div>
        )}
      </main>
    </div>
  );
}
`

fs.writeFileSync('src/pages/ChamadasCRM.tsx', content);
