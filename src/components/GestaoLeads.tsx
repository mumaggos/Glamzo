import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Papa from 'papaparse';
import { Upload, Users, Key, Link as LinkIcon, Check, Loader2, AlertCircle } from 'lucide-react';
import { SalesAgent } from '../types';

interface GestaoLeadsProps {
  agents: SalesAgent[];
}

export default function GestaoLeads({ agents }: GestaoLeadsProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [distributing, setDistributing] = useState(false);
  const [distributeMsg, setDistributeMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [leadCount, setLeadCount] = useState<number | ''>('');
  const [senhaAcesso, setSenhaAcesso] = useState<string>('');
  const [availableLeads, setAvailableLeads] = useState<number>(0);
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [leadsFilter, setLeadsFilter] = useState<'livres' | 'atribuidas' | 'usadas'>('usadas');
  
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAvailableLeads();
  }, []);

  const fetchAvailableLeads = async () => {
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
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
      setUploadMessage(null);
    }
  };

  const processCsv = async () => {
    if (!csvFile) return;
    setUploading(true);
    setUploadMessage(null);

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // Expected columns: Nome, Telefone
          const data = results.data as any[];
          const validLeads = data
            .map(row => {
              const nome = row.Nome || row.nome || row.NOME || row.nome_loja;
              const telefone = row.Telefone || row.telefone || row.TELEFONE;
              return { nome_loja: nome, telefone: telefone?.toString().trim() };
            })
            .filter(lead => lead.nome_loja && lead.telefone);

          if (validLeads.length === 0) {
            setUploadMessage({ type: 'error', text: 'Nenhuma lead válida encontrada. Verifique se o CSV contém as colunas "Nome" e "Telefone".' });
            setUploading(false);
            return;
          }

          // Use our backend API to upsert leads securely or do it directly if RLS allows.
          // Since we need to bypass possible unique constraints gracefully, let's use the API route.
          const res = await fetch('/api/admin/leads/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leads: validLeads })
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Erro na importação');
          }

          const resData = await res.json();
          let msg = `Foram importadas ${resData.count} novas leads com sucesso de um total de ${resData.total}.`;
          if (resData.duplicates > 0) {
            msg += ` (${resData.duplicates} leads ignoradas por telefone duplicado)`;
          }
          setUploadMessage({ type: 'success', text: msg });
          setCsvFile(null);
          // reset input
          const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
          
          fetchAvailableLeads();
        } catch (err: any) {
          console.error(err);
          setUploadMessage({ type: 'error', text: err.message || 'Erro ao importar CSV.' });
        } finally {
          setUploading(false);
        }
      },
      error: (err) => {
        setUploadMessage({ type: 'error', text: `Erro a ler o CSV: ${err.message}` });
        setUploading(false);
      }
    });
  };

  const handleDistribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !leadCount || !senhaAcesso) return;
    
    const count = parseInt(leadCount.toString());
    if (count > availableLeads) {
      setDistributeMsg({ type: 'error', text: 'Não existem leads suficientes disponíveis.' });
      return;
    }

    try {
      setDistributing(true);
      setDistributeMsg(null);
      setGeneratedLink(null);

      const res = await fetch('/api/admin/leads/distribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          count: count,
          senhaAcesso: senhaAcesso
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro na distribuição');
      }

      const data = await res.json();
      setDistributeMsg({ type: 'success', text: `Foram atribuídas ${data.count} leads ao comercial.` });
      
      const link = `${window.location.origin}/chamadas/${selectedAgent}`;
      setGeneratedLink(link);
      
      setLeadCount('');
      setSenhaAcesso('');
      fetchAvailableLeads();

    } catch (err: any) {
      console.error(err);
      setDistributeMsg({ type: 'error', text: err.message || 'Erro ao atribuir leads.' });
    } finally {
      setDistributing(false);
    }
  };

  const copyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import CSV */}
        <div className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900">Importar Leads (CSV)</h3>
              <p className="text-xs text-slate-500">Colunas necessárias: Nome, Telefone</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <input 
              type="file" 
              id="csv-upload"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-xl file:border-0
                file:text-xs file:font-bold
                file:bg-purple-50 file:text-purple-700
                hover:file:bg-purple-100
                cursor-pointer border border-slate-200 rounded-xl p-2"
            />
            
            <button
              onClick={processCsv}
              disabled={!csvFile || uploading}
              className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              {uploading ? 'A processar...' : 'Importar Base de Dados'}
            </button>

            {uploadMessage && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-start gap-2 ${uploadMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {uploadMessage.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
                {uploadMessage.text}
              </div>
            )}
          </div>
        </div>

        {/* Distribute Leads */}
        <div className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900">Atribuir Leads</h3>
                <p className="text-xs text-slate-500">Gere um acesso único de CRM</p>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-2xl font-black text-slate-900">{availableLeads}</span>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Leads Livres</span>
            </div>
          </div>

          <form onSubmit={handleDistribute} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Comercial</label>
              <select
                required
                value={selectedAgent}
                onChange={e => setSelectedAgent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Selecione um comercial...</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.team_name || 'Sem Equipa'})</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantidade de Leads</label>
                <input
                  type="number"
                  min="1"
                  max={availableLeads}
                  required
                  value={leadCount}
                  onChange={e => setLeadCount(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="Ex: 50"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Senha de Acesso</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={senhaAcesso}
                    onChange={e => setSenhaAcesso(e.target.value)}
                    placeholder="Ex: pwd123"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={distributing || availableLeads === 0}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {distributing && <Loader2 className="w-4 h-4 animate-spin" />}
              Distribuir Lote & Gerar Acesso
            </button>
          </form>

          {distributeMsg && (
            <div className={`mt-4 p-3 rounded-xl text-xs font-bold flex items-start gap-2 ${distributeMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {distributeMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
              {distributeMsg.text}
            </div>
          )}

          {generatedLink && (
            <div className="mt-4 p-4 border border-emerald-200 bg-emerald-50 rounded-xl">
              <p className="text-xs font-bold text-emerald-800 mb-2">Link de Trabalho do Comercial:</p>
              <div className="flex items-center gap-2">
                <input 
                  readOnly 
                  value={generatedLink}
                  className="flex-1 bg-white border border-emerald-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 outline-none"
                />
                <button
                  onClick={copyLink}
                  className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shrink-0"
                  title="Copiar Link"
                >
                  {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      
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
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${leadsFilter === 'livres' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              Livres
            </button>
            <button
              onClick={() => setLeadsFilter('atribuidas')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${leadsFilter === 'atribuidas' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              Atribuídas
            </button>
            <button
              onClick={() => setLeadsFilter('usadas')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${leadsFilter === 'usadas' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
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
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      lead.estado_chamada === 'pendente' ? 'bg-amber-100 text-amber-700' :
                      lead.estado_chamada === 'fechou_pro' ? 'bg-emerald-100 text-emerald-700' :
                      lead.estado_chamada === 'fechou_terminal' ? 'bg-purple-100 text-purple-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
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
    </div>
  );
}
