import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Briefcase, Calendar, BarChart3, Megaphone, Smartphone, 
  BrainCircuit, ShieldCheck, HeartHandshake, Check, Sparkles, 
  ArrowRight, Star, Zap, ChevronDown, CheckCircle2
} from 'lucide-react';

export default function Partner() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const searchParams = new URLSearchParams(window.location.search);
    const ref = searchParams.get('ref');
    if (ref) {
      localStorage.setItem('sales_agent_ref', ref);
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
      q: "O que é a caução de 9.90€ no Plano Terminal?",
      a: "O Plano Terminal inclui o envio de um Tablet físico (Samsung/Lenovo) configurado para a sua receção. A caução única de 9.90€ serve apenas para ativar o envio e seguro do equipamento. O equipamento permanece associado à sua conta enquanto a subscrição estiver ativa."
    },
    {
      q: "Tenho de assinar contrato de fidelização?",
      a: "Não! A Glamzo funciona num modelo de subscrição mensal transparente. Pode cancelar, fazer upgrade ou downgrade do seu plano a qualquer momento diretamente no seu painel."
    },
    {
      q: "Como recebo os pagamentos online dos clientes?",
      a: "A Glamzo integra nativamente com a Stripe (Glamzo Pay). O dinheiro das reservas online entra diretamente na sua conta conectada e pode ser transferido para o seu banco (IBAN) com total segurança."
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
            <span>O Software N.º 1 para Beleza em Portugal</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-slate-900 leading-[1.05] max-w-5xl mx-auto mb-6">
            Lote a sua agenda, <br />
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-500 bg-clip-text text-transparent">Multiplique o seu lucro.</span>
          </h1>
          
          <p className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
            A Glamzo é o ecossistema de elite focado a 100% no crescimento de Salões, Barbearias e SPAs. Agenda inteligente, pagamentos integrados e marketing automático.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
            <Link
              to="/partner/signup"
              className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white font-black py-4 px-8 rounded-2xl text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 hover:scale-[1.02]"
            >
              <span>Começar 14 Dias Grátis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/partner/login"
              className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-8 py-4 rounded-2xl text-sm transition-colors flex justify-center"
            >
              Iniciar Sessão
            </Link>
          </div>
          <p className="text-xs text-slate-400 mt-5 font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Sem compromisso. Cancele quando quiser.
          </p>
        </div>
      </section>

      {/* 2. Metrics - Prova Social */}
      <section className="py-10 bg-slate-900 border-y border-slate-800 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-800/50">
            <div>
              <div className="text-4xl font-black text-white">+40%</div>
              <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Aumento de Marcações</div>
            </div>
            <div>
              <div className="text-4xl font-black text-emerald-400">-90%</div>
              <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Redução de No-Shows</div>
            </div>
            <div>
              <div className="text-4xl font-black text-white">2.5h</div>
              <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Poupadas por Dia</div>
            </div>
            <div>
              <div className="text-4xl font-black text-purple-400">+143%</div>
              <div className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Retenção de Clientes</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bento Grid - Funcionalidades */}
      <section className="py-24 bg-[#F8F9FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4">Tudo o que precisa num só lugar.</h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">O ecossistema perfeito desenhado para lhe devolver o tempo e aumentar o faturamento do seu espaço.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            
            {/* Bento 1: Agenda (Ocupa 2 colunas) */}
            <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10"><Calendar className="w-32 h-32" /></div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 relative z-10"><Calendar className="w-6 h-6" /></div>
              <h3 className="text-xl font-black text-slate-900 mb-2 relative z-10">Agenda Inteligente</h3>
              <p className="text-sm text-slate-500 leading-relaxed relative z-10 max-w-md">Controle horários, folgas e disponibilidades de cada profissional. O sistema previne cruzamentos, organiza as pausas e envia lembretes automáticos por si.</p>
            </div>

            {/* Bento 2: Pagamentos */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 relative z-10"><ShieldCheck className="w-6 h-6" /></div>
              <h3 className="text-xl font-black text-slate-900 mb-2 relative z-10">Glamzo Pay</h3>
              <p className="text-sm text-slate-500 leading-relaxed relative z-10">Fim aos cancelamentos falsos. Cobre os serviços online com MBWay, Apple Pay e Cartão diretamente na plataforma.</p>
            </div>

            {/* Bento 3: Marketing */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 relative z-10"><Megaphone className="w-6 h-6" /></div>
              <h3 className="text-xl font-black text-slate-900 mb-2 relative z-10">Marketing & Vales</h3>
              <p className="text-sm text-slate-500 leading-relaxed relative z-10">Crie cupões de desconto para atrair clientes em dias lentos e construa uma rede de fidelização sólida.</p>
            </div>

            {/* Bento 4: Analytics (Ocupa 2 colunas) */}
            <div className="md:col-span-2 bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative text-white">
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-purple-500/20 blur-3xl rounded-full" />
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-purple-400 flex items-center justify-center mb-6 relative z-10"><BarChart3 className="w-6 h-6" /></div>
              <h3 className="text-xl font-black mb-2 relative z-10">Análise Financeira & Performance</h3>
              <p className="text-sm text-slate-400 leading-relaxed relative z-10 max-w-md">Saiba exatamente quanto faturou por dia, qual o seu lucro líquido e qual o profissional que gera mais receita. Exporte faturas num clique.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Estrutura de Preços (Foco no Terminal) */}
      <section className="py-24 bg-white border-y border-slate-100 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4">Invista no crescimento.</h2>
            <p className="text-slate-500 text-sm">Sem taxas surpresa. Cancele quando quiser. Escolha o plano perfeito.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
            
            {/* Plano PRO (Base) */}
            <div className="bg-[#F8F9FC] border border-slate-200 p-8 sm:p-10 rounded-[2rem] relative transition-all">
              <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase block font-mono">100% Digital</span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">Glamzo PRO</h3>
              
              <div className="mt-6 mb-8 flex items-end gap-2">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">19.90€</span>
                <span className="text-sm text-slate-500 font-bold mb-1">/mês</span>
              </div>
              
              <p className="text-sm text-slate-600 font-medium mb-8 h-10">O essencial para colocar o seu salão no mapa e receber marcações ilimitadas.</p>

              <ul className="space-y-4 text-sm text-slate-700 font-semibold mb-10">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Agenda e Staff Ilimitado</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Página Web (SEO Otimizado)</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Notificações & Lembretes Cliente</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Pagamentos Stripe Integrados</li>
              </ul>

              <Link to="/partner/signup" className="block w-full text-center bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-800 font-black py-4 rounded-2xl transition-all text-sm shadow-sm">
                Teste 14 Dias Grátis
              </Link>
            </div>

            {/* Plano TERMINAL (Destaque) */}
            <div className="bg-slate-900 border border-purple-500 p-8 sm:p-10 rounded-[2.5rem] relative shadow-2xl shadow-purple-900/20 transform md:scale-105 z-10 overflow-hidden group">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-bl-2xl shadow-lg">Mais Popular</div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-600/20 blur-[80px] rounded-full group-hover:bg-purple-600/30 transition-all duration-500" />
              
              <span className="text-[10px] font-black tracking-widest text-purple-400 uppercase block font-mono flex items-center gap-2"><Star className="w-3.5 h-3.5" /> Hardware + Digital</span>
              <h3 className="text-2xl font-black text-white mt-2">Glamzo PRO Terminal</h3>
              
              <div className="mt-6 mb-8 flex flex-col">
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-white tracking-tighter">24.90€</span>
                  <span className="text-sm text-slate-400 font-bold mb-1">/mês</span>
                </div>
                <div className="mt-3 inline-flex">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-lg">
                    + 9.90€ Caução Única (Tablet)
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-slate-300 font-medium mb-8 h-10">A experiência Elite. A sua receção equipada com um tablet oficial de gestão Glamzo.</p>

              <ul className="space-y-4 text-sm text-white font-semibold mb-10 relative z-10">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-purple-400 shrink-0" /> Tudo do Plano Digital</li>
                <li className="flex items-center gap-3"><Zap className="w-5 h-5 text-amber-400 shrink-0" /> <strong>Tablet Físico (Samsung/Lenovo)</strong></li>
                <li className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-purple-400 shrink-0" /> Alertas Sonoros de Novas Reservas</li>
                <li className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" /> Destaque Premium no Marketplace</li>
              </ul>

              <Link to="/partner/signup" className="relative z-10 block w-full text-center bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black py-4 rounded-2xl transition-all text-sm shadow-lg shadow-purple-900/50">
                Ativar Terminal & Teste Grátis
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section className="py-24 bg-[#F8F9FC]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Perguntas Frequentes</h2>
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
          <h2 className="text-3xl font-black text-white mb-6">Pronto para transformar o seu espaço?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/partner/signup" className="bg-white hover:bg-slate-100 text-slate-900 font-black py-4 px-8 rounded-2xl text-sm transition-colors shadow-xl">
              Registar Agora
            </Link>
            <Link to="/partner/login" className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold py-4 px-8 rounded-2xl text-sm transition-colors">
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
