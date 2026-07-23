import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, X, Store, Calendar, CreditCard } from 'lucide-react';
import { SalesAgent } from '../types';
import { useTranslation } from "react-i18next";

interface AgentStoresModalProps {
  agent: SalesAgent;
  onClose: () => void;
}

export default function AgentStoresModal({ agent, onClose }: AgentStoresModalProps) {
    const { t } = useTranslation();
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('id, name, created_at, selected_plan, tablet_requested, status')
          .eq('agent_id', agent.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setStores(data || []);
      } catch (error) {
        console.error('Error fetching stores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [agent.id]);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Store className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t('txt_lojas_cadastradas') || 'Lojas Cadastradas'}</h2>
              <p className="text-sm text-slate-500">{t('txt_comercial') || 'Comercial:'} {agent.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>{t('txt_a_carregar_lojas') || 'A carregar lojas...'}</p>
            </div>
          ) : stores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Store className="w-12 h-12 mb-4 text-slate-300" />
              <p>{t('txt_nenhuma_loja_cadastrada_por_es') || 'Nenhuma loja cadastrada por este comercial.'}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {stores.map(store => (
                <div key={store.id} className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">{store.name || 'Sem Nome'}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(store.created_at).toLocaleDateString('pt-PT')}
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        
                                                          {t('txt_plano') || 'Plano:'} {store.selected_plan ? (
                          store.selected_plan === 'app_tablet' || store.selected_plan === 'pro_terminal' || store.selected_plan.includes('terminal') || store.tablet_requested
                            ? <span className="font-medium text-emerald-600">{t('txt_pro_terminal') || 'PRO + Terminal'}</span>
                            : <span className="font-medium text-blue-600">{t('txt_pro_7') || 'PRO'}</span>
                        ) : (
                          <span className="text-amber-600 font-medium">{t('txt_incompleto_8') || 'Incompleto'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      store.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      store.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {store.status === 'active' ? 'Ativo' : store.status === 'pending' ? 'Pendente' : store.status || 'Incompleto'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
