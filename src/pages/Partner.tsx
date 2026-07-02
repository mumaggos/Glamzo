import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Briefcase, Calendar, BarChart3, Megaphone, Smartphone, 
  BrainCircuit, ShieldCheck, HeartHandshake, Check, Sparkles, ArrowRight 
} from 'lucide-react';

export default function Partner() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (user && profile?.role === 'business') {
      navigate('/dashboard', { replace: true });
    } else if (user && profile?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, profile, navigate]);

  return (
    <div id="partner-landing-view" className="min-h-screen bg-[#fafbfc] flex flex-col justify-between font-sans selection:bg-purple-100 selection:text-purple-900 pb-24 animate-fade-in">
      
      {/* 1. Immersive Hero Section - Alinhado com a Homepage */}
      <section className="relative pt-20 pb-16 border-b border-slate-100 bg-white">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-rose-500/5 rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-100 rounded-full text-[10px] font-bold tracking-wider text-purple-600 mb-6 uppercase">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Gestão Completa para Salões e Barbearias em Portugal</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-display font-medium tracking-tight text-slate-900 leading-[1.08] max-w-4xl mx-auto mb-6">
            Gira o seu negócio, <br />
            <span className="bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent">Multiplique as suas marcações.</span>
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
            A Glamzo é a plataforma de elite de gestão de agendas, faturação integrada, marketing de fidelização e acompanhamento de clientes focada a 100% no crescimento de Salões, Barbearias e SPAs.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <Link
              to="/partner/signup"
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-8 rounded-xl text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-purple-200 hover:scale-[1.01]"
            >
              <span>Registar Estabelecimento</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/partner/login"
              className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold px-8 py-3.5 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Iniciar Sessão Profissional
            </Link>
          </div>
          
          <p className="text-[11px] text-slate-500 mt-4 font-semibold">
            Experimente sem qualquer compromisso. Apoio direto na importação dos seus dados incluído.
          </p>
        </div>
      </section>

      {/* 2. Metrics Section */}
      <section className="py-12 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-3">
              <div className="text-3xl sm:text-4xl font-display font-medium text-purple-600">+40%</div>
              <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Aumento de Marcações</div>
            </div>
            <div className="p-3">
              <div className="text-3xl sm:text-4xl font-display font-medium text-rose-500">-90%</div>
              <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Redução de No-Shows</div>
            </div>
            <div className="p-3">
              <div className="text-3xl sm:text-4xl font-display font-medium text-slate-900">2.5 Horas</div>
              <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Poupadas Diariamente</div>
            </div>
            <div className="p-3">
              <div className="text-3xl sm:text-4xl font-display font-medium text-purple-600">+143%</div>
              <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Retenção de Clientes</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 Terminal Glamzo Section */}
      <section className="py-20 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-[9px] font-bold uppercase text-purple-300 tracking-wider mb-4">
                <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                <span>O Futuro da Recepção</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-display font-medium tracking-tight mb-6">
                O Seu Novo <span className="text-purple-400">Terminal Glamzo</span>
              </h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-lg">
                Esqueça o papel e a caneta. O nosso painel otimizado para tablets permite-lhe gerir a agenda, 
                confirmar clientes, aceitar marcações e processar pagamentos num ecrã deslumbrante e ultra-rápido, 
                mesmo ao balcão.
              </p>
              <ul className="space-y-4 text-slate-300 text-sm font-medium">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  Interface limpa e profissional para a rececionista.
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  Modo ecrã inteiro com atualizações ao segundo.
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  Design premium que eleva a imagem do seu salão.
                </li>
              </ul>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden border-8 border-slate-900 shadow-2xl relative group bg-slate-50 flex flex-col">
                <iframe src="/explore" className="w-full h-full border-0 pointer-events-none" title="Terminal Preview" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400 font-mono mb-1">Status</div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Sincronizado
                      </div>
                    </div>
                    <div className="bg-purple-600 text-white text-xs font-bold px-4 py-2 rounded-xl">
                      Modo Terminal
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Grid: Advantages / Core Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 border border-purple-100 rounded text-[9px] font-bold uppercase text-purple-600 tracking-widest mb-3">
              <span>Recursos do Ecossistema</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-display font-medium tracking-tight text-slate-900">Tudo para Gerir o Seu Salão num Só Lugar</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl mx-auto">
              Dispomos das ferramentas ideais para digitalizar o seu salão com total independência e facilidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="group bg-white rounded-2xl border border-slate-100 p-8 flex flex-col justify-between hover:border-purple-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(15,23,42,0.04)] -translate-y-0 hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-6">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">Agenda Simples</h3>
                <p className="text-slate-500 text-xs mt-3 leading-relaxed">
                  Controle horários, folgas e disponibilidades de cada profissional numa interface visual intuitiva e rápida. Confirmações automáticas por e-mail incluídas.
                </p>
              </div>
              <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mt-6 block">Incluído no Plano</span>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white rounded-2xl border border-slate-100 p-8 flex flex-col justify-between hover:border-purple-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(15,23,42,0.04)] -translate-y-0 hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">Relatórios & Resultados</h3>
                <p className="text-slate-500 text-xs mt-3 leading-relaxed">
                  Monitorize o desempenho com métricas reais de faturação, valores médios por cliente, serviços mais requisitados e controlo de pagamentos em atraso.
                </p>
              </div>
              <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mt-6 block">Sincronização Direta</span>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white rounded-2xl border border-slate-100 p-8 flex flex-col justify-between hover:border-purple-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(15,23,42,0.04)] -translate-y-0 hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-6">
                  <Megaphone className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">Marketing de Fidelização</h3>
                <p className="text-slate-500 text-xs mt-3 leading-relaxed">
                  Promova campanhas de fidelidade com base no histórico de visitas. Crie cupões de desconto para atrair clientes de volta em dias de menor afluência.
                </p>
              </div>
              <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mt-6 block">Mais Clientes</span>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white rounded-2xl border border-slate-100 p-8 flex flex-col justify-between hover:border-purple-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(15,23,42,0.04)] -translate-y-0 hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-6">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">Otimização IA</h3>
                <p className="text-slate-500 text-xs mt-3 leading-relaxed">
                  A nossa tecnologia analisa as horas de maior movimento para sugerir as melhores opções e promover campanhas rápidas focadas no preenchimento de horários vazios.
                </p>
              </div>
              <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mt-6 block">Estatísticas Reais</span>
            </div>

            {/* Feature 5 */}
            <div className="group bg-white rounded-2xl border border-slate-100 p-8 flex flex-col justify-between hover:border-purple-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(15,23,42,0.04)] -translate-y-0 hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">Pagamento Integrado</h3>
                <p className="text-slate-500 text-xs mt-3 leading-relaxed">
                  Garanta segurança financeira recebendo depósitos no momento do agendamento, protegendo o seu negócio contra cancelamentos de última hora.
                </p>
              </div>
              <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mt-6 block">Garantia Financeira</span>
            </div>

            {/* Feature 6 */}
            <div className="group bg-white rounded-2xl border border-slate-100 p-8 flex flex-col justify-between hover:border-purple-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(15,23,42,0.04)] -translate-y-0 hover:-translate-y-1 transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-6">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">Apoio de Proximidade</h3>
                <p className="text-slate-500 text-xs mt-3 leading-relaxed">
                  Linha de suporte em direto. Auxiliamos na transição rápida de dados da sua atual lista de clientes para começar sem qualquer complicação.
                </p>
              </div>
              <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mt-6 block">Apoio Garantido</span>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Subscription Pricing Structure */}
      <section className="py-20 bg-purple-50/40 border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-50 border border-rose-100 rounded text-[9px] font-bold uppercase text-rose-600 tracking-wider mb-3">
            <span>Planos Flexíveis</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-medium text-slate-900 tracking-tight">Escolha o Plano Ideal para Si</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Diga adeus a taxas ocultas. Opções adaptadas ao tamanho do seu negócio.</p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Base Plan */}
            <div className="bg-white border-2 border-rose-500 p-10 rounded-3xl relative overflow-hidden shadow-xl shadow-rose-100/50 transition-all">
              <div className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl">Experimente Grátis</div>
              <span className="text-[10px] font-black tracking-widest text-rose-600 uppercase block font-mono">Plano Digital</span>
              <div className="mt-4 flex flex-col items-center justify-center mb-4">
                <div className="flex items-baseline">
                  <span className="text-4xl font-display font-medium text-slate-900 bg-gradient-to-r from-rose-500 to-orange-400 bg-clip-text text-transparent">19.90€</span>
                  <span className="text-xs text-slate-500 ml-1 font-medium">/mês</span>
                </div>
                <span className="text-[10px] text-rose-600 font-medium mt-1 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">14 Dias Totalmente Grátis</span>
              </div>
              
              <p className="text-xs text-slate-500 mt-4 leading-normal font-medium h-10">
                O essencial para digitalizar, impulsionar e gerir todo o seu salão.
              </p>

              <ul className="mt-8 space-y-3.5 text-left text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Agenda e Marcações Ilimitadas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Página Online & App Glamzo (Destaque)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Lembretes Automáticos por Email / Notificação (Redução No-Shows)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Equipa, Serviços e Produtos Ilimitados</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Relatórios de Faturação, Receitas e Desempenho</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Marketing, Campanhas e Promoções de Fidelização</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>QR Code da sua Loja para a Montra</span>
                </li>
              </ul>

              <Link
                to="/partner/signup"
                className="mt-10 block w-full text-center bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-xl transition-all font-sans text-xs sm:text-sm cursor-pointer shadow-md shadow-rose-200"
              >
                Começar Teste de 14 Dias Grátis
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white border-2 border-purple-500 p-10 rounded-3xl relative overflow-hidden shadow-xl shadow-purple-100/50 transform md:-translate-y-4">
              <div className="absolute top-0 right-0 bg-purple-500 text-white text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl">Plano Recomendado</div>
              <span className="text-[10px] font-black tracking-widest text-purple-600 uppercase block font-mono">Plano Terminal</span>
              <div className="mt-4 flex flex-col items-center justify-center mb-4">
                <div className="flex items-baseline">
                  <span className="text-4xl font-display font-medium text-slate-900 bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent">24.99€</span>
                  <span className="text-xs text-slate-500 ml-1 font-medium">/mês</span>
                </div>
                <div className="flex flex-col items-center gap-1 mt-1">
                  <span className="text-[10px] text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">14 Dias Totalmente Grátis</span>
                  <span className="text-[10px] text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">+9.99€ Caução Única (Equipamento)</span>
                </div>
              </div>
              
              <p className="text-xs text-slate-500 mt-4 leading-normal font-medium h-10">
                A experiência premium ao balcão, com tablet incluído e muito mais.
              </p>

              <ul className="mt-8 space-y-3.5 text-left text-xs text-slate-600 font-medium">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="font-bold text-slate-900">Tudo do Plano Digital, mais:</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Terminal Inteligente de Balcão (Tablet Incluído)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Sistema Integrado de Cobranças na Loja</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Destaque Premium VIP na App (Top Results)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Assistência técnica prioritária e dedicada 24/7</span>
                </li>
              </ul>

              <Link
                to="/partner/signup"
                className="mt-10 block w-full text-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition-all font-sans text-xs sm:text-sm cursor-pointer shadow-md shadow-purple-200"
              >
                Solicitar Terminal + 14 Dias Grátis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA Final */}
      <section className="py-20 text-center max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-display font-medium text-slate-900">Pronto para digitalizar o seu estabelecimento?</h2>
        <p className="text-slate-550 mt-3 text-slate-500 text-xs sm:text-sm font-medium font-sans">
          Registe o seu espaço na Glamzo e facilite a forma como os seus clientes agendam e gerem todos os seus serviços.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/partner/signup"
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3.5 rounded-xl text-xs sm:text-sm tracking-wide transition-all shadow-md shadow-purple-200 cursor-pointer"
          >
            Registar Espaço Comercial
          </Link>
          <Link
            to="/partner/login"
            className="w-full sm:w-auto text-slate-500 hover:text-slate-900 px-5 py-2 font-bold text-xs sm:text-sm tracking-wide cursor-pointer transition-colors"
          >
            Iniciar Sessão Profissional
          </Link>
        </div>
      </section>

    </div>
  );
}
