import SeoHead from '../components/SeoHead';
import { LocalizedLink } from '../components/LocalizedLink';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useLocalizedNavigate } from '../hooks/useLocalizedNavigate';
import { 
  Briefcase, Calendar, BarChart3, Megaphone, Smartphone, 
  BrainCircuit, ShieldCheck, HeartHandshake, Check, Sparkles, 
  ArrowRight, Star, Zap, ChevronDown, CheckCircle2
} from 'lucide-react';

export default function Partner() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const navigate = useLocalizedNavigate();
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

  const faqs = (t('partnerPage.faqs', { returnObjects: true }) as Array<{q: string, a: string}>) || [
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


const partnerSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Glamzo Parceiros",
  "operatingSystem": "Web",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR"
  }
};

  return (
    <div id="partner-landing-view" className="min-h-screen bg-[#F8F9FC] flex flex-col justify-between font-sans selection:bg-purple-100 selection:text-purple-900 pb-0 animate-fade-in">
      <SeoHead title="Glamzo para Parceiros | Software de Gestão para Salões" description="Gira o seu salão, barbearia ou clínica de estética com o Glamzo. Sem mensalidades, sem custos escondidos. Comece a receber marcações online hoje." schema={partnerSchema} />

      
      {/* 1. Hero Section - Alto Impacto */}
      <section className="relative pt-24 pb-20 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 border border-purple-100 rounded-full text-xs font-black tracking-widest text-purple-600 mb-8 uppercase shadow-sm">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>{t("partnerPage.heroPill", "O Software N.º 1 para Beleza em Portugal")}</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-slate-900 leading-[1.05] max-w-5xl mx-auto mb-6">
            {t("partnerPage.partnerHeroTitle1", "Lote a sua agenda, ")}<br />
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-500 bg-clip-text text-transparent">{t("partnerPage.partnerHeroTitle2", "Multiplique o seu lucro.")}</span>
          </h1>
          
          <p className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
            {t("partnerPage.heroSubtitle")}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
            <LocalizedLink
              to="/partner/signup"
              className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white font-black py-4 px-8 rounded-2xl text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 hover:scale-[1.02]"
            >
              <span>{t("partnerPage.planProBtn", "Teste 14 Dias Grátis")}</span>
              <ArrowRight className="w-4 h-4" />
            </LocalizedLink>
            <LocalizedLink
              to="/partner/login"
              className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-8 py-4 rounded-2xl text-sm transition-colors flex justify-center"
            >
              {t("navbar.signIn", "Iniciar Sessão")}
            </LocalizedLink>
          </div>
          <p className="text-xs text-slate-400 mt-5 font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {t("partnerPage.cancelAnytime", "Sem compromisso. Cancele quando quiser.")}
          </p>
        </div>
      </section>

      {/* 2. Metrics - Prova Social */}
      <section className="py-10 bg-slate-900 border-y border-slate-800 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-800/50">
            <div>
              <div className="text-4xl font-black text-white">+40%</div>
              <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{t("partnerPage.metric1", "Aumento de Marcações")}</div>
            </div>
            <div>
              <div className="text-4xl font-black text-emerald-400">-90%</div>
              <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{t("partnerPage.metric2", "Redução de No-Shows")}</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white">2.5h</div>
              <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{t("partnerPage.metric3", "Poupadas por Dia")}</div>
            </div>
            <div>
              <div className="text-4xl font-black text-purple-400">+143%</div>
              <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{t("partnerPage.metric4", "Retenção de Clientes")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bento Grid - Funcionalidades */}
      <section className="py-24 bg-[#F8F9FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4">{t('partnerPage.featuresTitle')}</h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">{t('partnerPage.featuresSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            
            {/* Bento 1: {t('partnerPage.planProFeat1')} (Ocupa 2 colunas) */}
            <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10"><Calendar className="w-32 h-32" /></div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 relative z-10"><Calendar className="w-6 h-6" /></div>
              <h3 className="text-xl font-black text-slate-900 mb-2 relative z-10">{t('partnerPage.heroPill2', 'Gestão de Agenda Inteligente')}</h3>
              <p className="text-sm text-slate-500 leading-relaxed relative z-10 max-w-md">{t('partnerPage.feat1Desc')}</p>
            </div>

            {/* Bento 2: Pagamentos */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 relative z-10"><ShieldCheck className="w-6 h-6" /></div>
              <h3 className="text-xl font-black text-slate-900 mb-2 relative z-10">{t('partnerPage.feat2Title')}</h3>
              <p className="text-sm text-slate-500 leading-relaxed relative z-10">{t('partnerPage.feat2Desc')}</p>
            </div>

            {/* Bento 3: Marketing */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 relative z-10"><Megaphone className="w-6 h-6" /></div>
              <h3 className="text-xl font-black text-slate-900 mb-2 relative z-10">{t('partnerPage.feat3Title')}</h3>
              <p className="text-sm text-slate-500 leading-relaxed relative z-10">{t('partnerPage.feat3Desc')}</p>
            </div>

            {/* Bento 4: Analytics (Ocupa 2 colunas) */}
            <div className="md:col-span-2 bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative text-white">
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-purple-500/20 blur-3xl rounded-full" />
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-purple-400 flex items-center justify-center mb-6 relative z-10"><BarChart3 className="w-6 h-6" /></div>
              <h3 className="text-xl font-black mb-2 relative z-10">{t('partnerPage.feat4Title')}</h3>
              <p className="text-sm text-slate-400 leading-relaxed relative z-10 max-w-md">{t('partnerPage.feat4Desc')}</p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Estrutura de Preços (Foco no Terminal) */}
      <section className="py-24 bg-white border-y border-slate-100 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4">{t('partnerPage.pricingTitle')}</h2>
            <p className="text-slate-500 text-sm">{t('partnerPage.pricingSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
            
            {/* Plano PRO (Base) */}
            <div className="bg-[#F8F9FC] border border-slate-200 p-8 sm:p-10 rounded-[2rem] relative transition-all">
              <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase block font-mono">{t('partnerPage.planProDigital')}</span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">Glamzo PRO</h3>
              
              <div className="mt-6 mb-8 flex items-end gap-2">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">19.90€</span>
                <span className="text-sm text-slate-500 font-bold mb-1">{t('partnerPage.perMonth')}</span>
              </div>
              
              <p className="text-sm text-slate-600 font-medium mb-8 h-10">{t('partnerPage.planProDesc')}</p>

              <ul className="space-y-4 text-sm text-slate-700 font-semibold mb-10">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> {t('partnerPage.planProFeat1')}</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> {t('partnerPage.planProFeat2')}</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> {t('partnerPage.planProFeat3')}</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> <strong>{t('partnerPage.planProFeat4')}</strong></li>
                
              </ul>

              <LocalizedLink to="/partner/signup" className="block w-full text-center bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-800 font-black py-4 rounded-2xl transition-all text-sm shadow-sm">
                {t('partnerPage.planProBtn')}
              </LocalizedLink>
              <p className="mt-4 text-[10px] text-slate-500 text-center leading-tight">{t('partnerPage.planProDisclaimer')}</p>
            </div>

            {/* Plano TERMINAL (Destaque) */}
            <div className="bg-slate-900 border border-purple-500 p-8 sm:p-10 rounded-[2.5rem] relative shadow-2xl shadow-purple-900/20 transform md:scale-105 z-10 overflow-hidden group">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-bl-2xl shadow-lg">{t('partnerPage.mostPopular')}</div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-600/20 blur-[80px] rounded-full group-hover:bg-purple-600/30 transition-all duration-500" />
              
              <span className="text-[10px] font-black tracking-widest text-purple-400 uppercase block font-mono flex items-center gap-2"><Star className="w-3.5 h-3.5" /> {t('partnerPage.planTermBadge')}</span>
              <h3 className="text-2xl font-black text-white mt-2">{t('partnerPage.planTermTitle')}</h3>
              
              <div className="mt-6 mb-8 flex flex-col">
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-white tracking-tighter">99€</span>
                  <span className="text-sm text-slate-400 font-bold mb-1">{t('partnerPage.oneTime')}</span>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  
                  <span className="inline-block text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg w-max">
                    {t('partnerPage.planTermShipping')}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-slate-300 font-medium mb-8 h-10">{t('partnerPage.planTermDesc')}</p>

              <ul className="space-y-4 text-sm text-white font-semibold mb-10 relative z-10">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-purple-400 shrink-0" /> {t('partnerPage.planTermFeat1')}</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-purple-400 shrink-0" /> {t('partnerPage.planTermFeat2')}</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-purple-400 shrink-0" /> {t('partnerPage.planTermFeat3', 'Sincronização direta com a Gestão de Agenda')}</li>
              </ul>

              <LocalizedLink to="/partner/signup" className="relative z-10 block w-full text-center bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black py-4 rounded-2xl transition-all text-sm shadow-lg shadow-purple-900/50">
                {t('partnerPage.planTermBtn')}
              </LocalizedLink>
            </div>

          </div>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section className="py-24 bg-[#F8F9FC]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">{t('partnerPage.faqTitle')}</h2>
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
          <h2 className="text-3xl font-black text-white mb-6">{t('partnerPage.ctaTitle')}</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <LocalizedLink to="/partner/signup" className="bg-white hover:bg-slate-100 text-slate-900 font-black py-4 px-8 rounded-2xl text-sm transition-colors shadow-xl">
              {t('partnerPage.ctaRegister')}
            </LocalizedLink>
            <LocalizedLink to="/partner/login" className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold py-4 px-8 rounded-2xl text-sm transition-colors">
              {t('partnerPage.ctaLogin')}
            </LocalizedLink>
          </div>
        </div>
      </section>

    </div>
  );
}
