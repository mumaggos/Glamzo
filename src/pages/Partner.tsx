import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { 
  Briefcase, Calendar, BarChart3, Megaphone, Smartphone, 
  BrainCircuit, ShieldCheck, HeartHandshake, Check, Sparkles, 
  ArrowRight, Star, Zap, ChevronDown, CheckCircle2
} from 'lucide-react';
import { useTranslation } from "react-i18next";

export default function Partner() {
    const { t } = useTranslation();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ref = searchParams.get('ref');
    if (ref) {
      localStorage.setItem('sales_agent_ref', ref);
      
      // Increment clicks safely via RPC (if not already incremented in this session)
      if (!sessionStorage.getItem(`tracked_ref_${ref}`)) {
        sessionStorage.setItem(`tracked_ref_${ref}`, 'true');
        const trackClick = async () => {
          try {
            await supabase.rpc('increment_agent_clicks', { agent_ref: ref });
          } catch (e) { console.error(e); }
        };
        trackClick();
      }
    }
  }, []);

  useEffect(() => {
    if (user && profile?.role === 'business') {
      navigate('/partner/dashboard', { replace: true });
    } else if (user && profile?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, profile, navigate]);

  const faqs = [
    {
      q: "Como funcionam os 14 dias grátis?",
      a: "Pode testar a plataforma Glamzo sem qualquer compromisso durante 14 dias. Não lhe será cobrado nenhum valor durante este período. Se decidir que não é para si, basta cancelar com um clique antes do fim do período."
    },
    {
      q: "Preciso mesmo de comprar o terminal de 99€ para cobrar presencialmente?",
      a: "Não! O plano PRO inclui o 'Tap-to-Pay', transformando o seu smartphone num terminal de pagamento seguro sem custo extra."
    },
    {
      q: "Tenho de assinar contrato de fidelização?",
      a: "Não! A Glamzo funciona num modelo de subscrição mensal transparente. Pode cancelar, fazer upgrade ou downgrade do seu plano a qualquer momento diretamente no seu painel."
    },
    {
      q: "A Glamzo cobra comissões sobre os meus serviços?",
      a: "Não cobramos comissões de marketplace ou de angariação (ao contrário de outras plataformas). Apenas aplicamos uma taxa de processamento transparente de 2% + 0.75€ (ou na moeda local) exclusivamente nas transações pagas por cartão para cobrir custos de rede. Dinheiro físico tem 0 taxas."
    }
  ];

  return (
    <div id="partner-landing-view" className="min-h-screen bg-[#F8F9FC] flex flex-col justify-between font-sans selection:bg-purple-100 selection:text-purple-900 pb-0 animate-fade-in">
      
      {/* 1. Hero Section - Alto Impacto */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 border border-purple-100 rounded-full text-xs font-black tracking-widest text-purple-600 mb-8 uppercase shadow-sm">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>{t('txt_o_software_n_1_para_beleza_em') || 'O Software N.º 1 para Beleza em Portugal'}</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-slate-900 leading-[1.05] max-w-5xl mx-auto mb-6">
            
                                  {t('txt_lote_a_sua_agenda') || 'Lote a sua agenda,'} <br />
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-500 bg-clip-text text-transparent">{t('txt_multiplique_o_seu_lucro') || 'Multiplique o seu lucro.'}</span>
          </h1>
          
          <p className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
            
                                  {t('txt_a_glamzo_o_ecossistema_de_elit') || 'A Glamzo é o ecossistema de elite focado a 100% no crescimento de Salões, Barbearias e SPAs. Agenda inteligente, pagamentos integrados e marketing automático.'}
                                </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
            <Link
              to="/partner/signup"
              className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white font-black py-4 px-8 rounded-2xl text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 hover:scale-[1.02]"
            >
              <span>{t('txt_come_ar_14_dias_gr_tis') || 'Começar 14 Dias Grátis'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/partner/login"
              className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-8 py-4 rounded-2xl text-sm transition-colors flex justify-center"
            >
              
                                        {t('txt_iniciar_sess_o') || 'Iniciar Sessão'}
                                      </Link>
          </div>
          <p className="text-xs text-slate-400 mt-5 font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />  {t('txt_sem_compromisso_cancele_quando') || 'Sem compromisso. Cancele quando quiser.'}
                                </p>
        </div>
      </section>

      {/* 2. Metrics - Prova Social */}
      <section className="py-10 bg-slate-900 border-y border-slate-800 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-800/50">
            <div>
              <div className="text-4xl font-black text-white">{t('txt_40') || '+40%'}</div>
              <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{t('txt_aumento_de_marca_es') || 'Aumento de Marcações'}</div>
            </div>
            <div>
              <div className="text-4xl font-black text-emerald-400">{t('txt_90') || '-90%'}</div>
              <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{t('txt_redu_o_de_no_shows') || 'Redução de No-Shows'}</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white">{t('txt_2_5h') || '2.5h'}</div>
              <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{t('txt_poupadas_por_dia') || 'Poupadas por Dia'}</div>
            </div>
            <div>
              <div className="text-4xl font-black text-purple-400">{t('txt_143') || '+143%'}</div>
              <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{t('txt_reten_o_de_clientes') || 'Retenção de Clientes'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bento Grid - Funcionalidades */}
      <section className="py-24 bg-[#F8F9FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4">{t('txt_tudo_o_que_precisa_num_s_lugar') || 'Tudo o que precisa num só lugar.'}</h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">{t('txt_o_ecossistema_perfeito_desenha') || 'O ecossistema perfeito desenhado para lhe devolver o tempo e aumentar o faturamento do seu espaço.'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            
            {/* Bento 1: Agenda (Ocupa 2 colunas) */}
            <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10"><Calendar className="w-32 h-32" /></div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 relative z-10"><Calendar className="w-6 h-6" /></div>
              <h3 className="text-xl font-black text-slate-900 mb-2 relative z-10">{t('txt_agenda_inteligente_19') || 'Agenda Inteligente'}</h3>
              <p className="text-sm text-slate-500 leading-relaxed relative z-10 max-w-md">{t('txt_controle_hor_rios_folgas_e_dis') || 'Controle horários, folgas e disponibilidades de cada profissional. O sistema previne cruzamentos, organiza as pausas e envia lembretes automáticos por si.'}</p>
            </div>

            {/* Bento 2: Pagamentos */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 relative z-10"><ShieldCheck className="w-6 h-6" /></div>
              <h3 className="text-xl font-black text-slate-900 mb-2 relative z-10">{t('txt_glamzo_pay') || 'Glamzo Pay'}</h3>
              <p className="text-sm text-slate-500 leading-relaxed relative z-10">{t('txt_fim_aos_cancelamentos_falsos_c') || 'Fim aos cancelamentos falsos. Cobre os serviços online com MBWay, Apple Pay e Cartão diretamente na plataforma.'}</p>
            </div>

            {/* Bento 3: Marketing */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 relative z-10"><Megaphone className="w-6 h-6" /></div>
              <h3 className="text-xl font-black text-slate-900 mb-2 relative z-10">{t('txt_marketing_vales') || 'Marketing & Vales'}</h3>
              <p className="text-sm text-slate-500 leading-relaxed relative z-10">{t('txt_crie_cup_es_de_desconto_para_a') || 'Crie cupões de desconto para atrair clientes em dias lentos e construa uma rede de fidelização sólida.'}</p>
            </div>

            {/* Bento 4: Analytics (Ocupa 2 colunas) */}
            <div className="md:col-span-2 bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative text-white">
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-purple-500/20 blur-3xl rounded-full" />
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-purple-400 flex items-center justify-center mb-6 relative z-10"><BarChart3 className="w-6 h-6" /></div>
              <h3 className="text-xl font-black mb-2 relative z-10">{t('txt_an_lise_financeira_performance') || 'Análise Financeira & Performance'}</h3>
              <p className="text-sm text-slate-400 leading-relaxed relative z-10 max-w-md">{t('txt_saiba_exatamente_quanto_faturo') || 'Saiba exatamente quanto faturou por dia, qual o seu lucro líquido e qual o profissional que gera mais receita. Exporte faturas num clique.'}</p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Estrutura de Preços (Foco no Terminal) */}
      <section className="py-24 bg-white border-y border-slate-100 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4">{t('txt_invista_no_crescimento') || 'Invista no crescimento.'}</h2>
            <p className="text-slate-500 text-sm">{t('txt_sem_taxas_surpresa_cancele_qua') || 'Sem taxas surpresa. Cancele quando quiser. Escolha o plano perfeito.'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
            
            {/* Plano PRO (Base) */}
            <div className="bg-[#F8F9FC] border border-slate-200 p-8 sm:p-10 rounded-[2rem] relative transition-all">
              <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase block font-mono">{t('txt_100_digital') || '100% Digital'}</span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{t('txt_glamzo_pro') || 'Glamzo PRO'}</h3>
              
              <div className="mt-6 mb-8 flex items-end gap-2">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">{t('txt_19_90') || '19.90€'}</span>
                <span className="text-sm text-slate-500 font-bold mb-1">/mês</span>
              </div>
              
              <p className="text-sm text-slate-600 font-medium mb-8 h-10">{t('txt_o_ecossistema_essencial_para_l') || 'O ecossistema essencial para lotar a sua agenda e gerir o seu espaço.'}</p>

              <ul className="space-y-4 text-sm text-slate-700 font-semibold mb-10">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" />  {t('txt_agenda_137') || 'Agenda'}</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" />  {t('txt_p_gina_web_seo') || 'Página Web SEO'}</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" />  {t('txt_pagamentos_online_e_tap_to_pay') || 'Pagamentos Online e Tap-to-Pay no Telemóvel'}</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> <strong>{t('txt_zero_taxas_por_funcion_rio_sta') || 'Zero taxas por funcionário (Staff Ilimitado)'}</strong></li>
                
              </ul>

              <Link to="/partner/signup" className="block w-full text-center bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-800 font-black py-4 rounded-2xl transition-all text-sm shadow-sm">
                
                                              {t('txt_teste_14_dias_gr_tis') || 'Teste 14 Dias Grátis'}
                                            </Link>
              <p className="mt-4 text-[10px] text-slate-500 text-center leading-tight">{t('txt_taxa_transparente_de_processa') || '(Taxa transparente de processamento: 2% + 0.75€ por transação paga via cartão. Zero comissões de marketplace).'}</p>
            </div>

            {/* Plano TERMINAL (Destaque) */}
            <div className="bg-slate-900 border border-purple-500 p-8 sm:p-10 rounded-[2.5rem] relative shadow-2xl shadow-purple-900/20 transform md:scale-105 z-10 overflow-hidden group">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-bl-2xl shadow-lg">{t('txt_mais_popular') || 'Mais Popular'}</div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-600/20 blur-[80px] rounded-full group-hover:bg-purple-600/30 transition-all duration-500" />
              
              <span className="text-[10px] font-black tracking-widest text-purple-400 uppercase block font-mono flex items-center gap-2"><Star className="w-3.5 h-3.5" />  {t('txt_opcional_equipamento') || 'Opcional - Equipamento'}</span>
              <h3 className="text-2xl font-black text-white mt-2">{t('txt_terminal_f_sico_glamzo_20') || 'Terminal Físico Glamzo'}</h3>
              
              <div className="mt-6 mb-8 flex flex-col">
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-white tracking-tighter">{t('txt_99') || '99€'}</span>
                  <span className="text-sm text-slate-400 font-bold mb-1">{t('txt_nico') || 'Único'}</span>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  
                  <span className="inline-block text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg w-max">
                    
                                                          {t('txt_portes_e_impostos_inclu_dos') || 'Portes e Impostos Incluídos'}
                                                        </span>
                </div>
              </div>
              
              <p className="text-sm text-slate-300 font-medium mb-8 h-10">{t('txt_esque_a_os_alugueres_mensais_c') || 'Esqueça os alugueres mensais. Compre a sua máquina e ela é sua para sempre.'}</p>

              <ul className="space-y-4 text-sm text-white font-semibold mb-10 relative z-10">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-purple-400 shrink-0" />  {t('txt_zero_mensalidades_ou_fideliza') || 'Zero Mensalidades ou Fidelização'}</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-purple-400 shrink-0" />  {t('txt_pagamentos_contactless_e_chip') || 'Pagamentos Contactless e Chip'}</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-purple-400 shrink-0" />  {t('txt_sincroniza_o_direta_com_a_agen') || 'Sincronização direta com a Agenda'}</li>
              </ul>

              <Link to="/partner/signup" className="relative z-10 block w-full text-center bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black py-4 rounded-2xl transition-all text-sm shadow-lg shadow-purple-900/50">
                
                                              {t('txt_adicionar_terminal_opcional') || 'Adicionar Terminal (Opcional)'}
                                            </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section className="py-24 bg-[#F8F9FC]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">{t('txt_perguntas_frequentes') || 'Perguntas Frequentes'}</h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all hover:border-purple-200 shadow-sm">
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                >
                  <span className="font-bold text-slate-800">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA Final Bar */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-white mb-6">{t('txt_pronto_para_transformar_o_seu') || 'Pronto para transformar o seu espaço?'}</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/partner/signup" className="bg-white hover:bg-slate-100 text-slate-900 font-black py-4 px-8 rounded-2xl text-sm transition-colors shadow-xl">
              
                                        {t('txt_registar_agora') || 'Registar Agora'}
                                      </Link>
            <Link to="/partner/login" className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold py-4 px-8 rounded-2xl text-sm transition-colors">
              
                                        {t('txt_j_tenho_conta') || 'Já tenho conta'}
                                      </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
