import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Award, TrendingUp, Sparkles, AlertCircle, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { Business } from '../../types';

export default function AdminMarketing({ salons }: { salons: Business[] }) {
  const [activeTab, setActiveTab] = useState<'top_partners' | 'awards' | 'collections'>('top_partners');
  const [topPartners, setTopPartners] = useState<Business[]>([]);
  
  useEffect(() => {
    // Filter out top partners
    setTopPartners(salons.filter(s => s.is_top_partner));
  }, [salons]);

  const toggleTopPartnerStatus = async (businessId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ 
          is_top_partner: !currentStatus,
          top_partner_score: !currentStatus ? 100 : 0
        })
        .eq('id', businessId);

      if (error) throw error;
      
      // The parent Admin.tsx needs to sync datasets to reflect the change globally, 
      // but we can optimistic update locally for now.
      setTopPartners(prev => {
        if (currentStatus) {
          return prev.filter(p => p.id !== businessId);
        } else {
          const biz = salons.find(s => s.id === businessId);
          if (biz) return [...prev, { ...biz, is_top_partner: true }];
          return prev;
        }
      });
      alert(`Status de Top Partner atualizado com sucesso!`);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h3 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          Marketing, Top Partners & Awards
        </h3>
        <p className="text-xs text-slate-600 mt-0.5">Faça a gestão dos parceiros de topo, prémios anuais e coleções temáticas da plataforma.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab('top_partners')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'top_partners' ? 'bg-purple-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          Top Partners ({topPartners.length})
        </button>
        <button
          onClick={() => setActiveTab('awards')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'awards' ? 'bg-purple-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          Glamzo Awards
        </button>
        <button
          onClick={() => setActiveTab('collections')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'collections' ? 'bg-purple-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          Coleções Temáticas
        </button>
      </div>

      {activeTab === 'top_partners' && (
        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 mb-6">
            <h4 className="font-bold text-purple-900 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              Programa Top Partner
            </h4>
            <p className="text-xs text-purple-700 leading-relaxed">
              O selo Top Partner é atribuído aos melhores salões da plataforma, garantindo-lhes um emblema de confiança nos seus perfis e prioridade máxima nos resultados de pesquisa. A certificação pode ser automatizada com base nas avaliações e número de reservas ou ativada manualmente.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {salons.map(salon => (
              <div key={salon.id} className={`flex items-center justify-between p-4 rounded-xl border ${salon.is_top_partner ? 'bg-amber-50/30 border-amber-200' : 'bg-white border-slate-200'}`}>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    {salon.name}
                    {salon.is_top_partner && <Award className="w-4 h-4 text-amber-500 fill-amber-500/20" />}
                  </h5>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">{salon.city}</p>
                </div>
                
                <button
                  onClick={() => toggleTopPartnerStatus(salon.id, !!salon.is_top_partner)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${salon.is_top_partner ? 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                >
                  {salon.is_top_partner ? 'Remover Selo' : 'Atribuir Selo'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'awards' && (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-10 text-center">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h4 className="font-bold text-slate-900 text-lg mb-2">Glamzo Awards</h4>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            A infraestrutura dos Glamzo Awards (votações, nomeações, cerimónias anuais) está a ser preparada. Em breve, poderá gerir as categorias e os vencedores de cada cidade.
          </p>
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-10 text-center">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h4 className="font-bold text-slate-900 text-lg mb-2">Coleções Temáticas & Tendências</h4>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            O motor de geração de coleções e tendências automáticas estará disponível na próxima atualização do painel, permitindo a gestão editorial de catálogos como "Casamentos", "Verão", etc.
          </p>
        </div>
      )}
    </div>
  );
}
