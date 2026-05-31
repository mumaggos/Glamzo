import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Calendar, BarChart3, Megaphone, Smartphone, 
  BrainCircuit, ShieldCheck, HeartHandshake, Check, Sparkles, ArrowRight 
} from 'lucide-react';

export default function Partner() {
  return (
    <div id="partner-landing-view" className="min-h-[calc(100vh-64px)] bg-slate-950 text-slate-100 font-sans selection:bg-rose-500/20 selection:text-white">
      
      {/* SaaS Premium Header/Hero */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-900 bg-radial-[circle_at_top] from-rose-950/15 via-transparent to-transparent">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-full text-xs font-semibold text-rose-400 mb-6 animate-fade-in uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SaaS para Profissionais de Beleza</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Gerencie o seu negócio, <br />
            <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-rose-400 bg-clip-text text-transparent">Multiplique as suas reservas.</span>
          </h1>
          
          <p className="mt-6 text-base sm:text-lg text-slate-405 max-w-2xl mx-auto leading-relaxed text-slate-400">
            A Glamzo é a plataforma unificada de gestão de agendas, faturação automatizada, marketing inteligente e CRM focada a 100% em Salões, Barbearias e SPAs.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <Link
              to="/partner/signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-rose-950 text-sm cursor-pointer"
            >
              <span>Registar Estabelecimento</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/partner/login"
              className="w-full sm:w-auto flex items-center justify-center bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 px-8 py-4 rounded-xl font-bold transition-all text-sm cursor-pointer"
            >
              Iniciar Sessão Profissional
            </Link>
          </div>
          
          <p className="text-[11px] text-slate-500 mt-4">
            Teste gratuito configurável pelo administrador da plataforma. Apoio na transição de dados incluído.
          </p>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-12 bg-slate-900/40 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-3">
              <div className="text-3xl sm:text-4xl font-extrabold text-white">+40%</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Aumento de Reservas</div>
            </div>
            <div className="p-3">
              <div className="text-3xl sm:text-4xl font-extrabold text-white">-90%</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Redução de No-Shows</div>
            </div>
            <div className="p-3">
              <div className="text-3xl sm:text-4xl font-extrabold text-white">2.5 Horas</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Poupadas Diariamente</div>
            </div>
            <div className="p-3">
              <div className="text-3xl sm:text-4xl font-extrabold text-white">+143%</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Retenção de Clientes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid: Advantages / Core Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-white tracking-tight">Arquitetura de Vantagens Operacionais</h2>
            <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
              Desenvolvemos as ferramentas ideias para digitalizar o seu salão com total independência e facilidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-slate-900 border border-slate-800/80 p-8 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-6">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Agenda Inteligente 360°</h3>
                <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                  Controle horários, folgas e disponibilidades de cada profissional em uma interface visual de alto desempenho. Envio de e-mails de confirmação e alertas automáticos.
                </p>
              </div>
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider mt-6">Incluído no Plano</span>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900 border border-slate-800/80 p-8 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Analytics & Faturação Real</h3>
                <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                  Monitor de desempenho completo com métricas reais de faturação, valores médios por cliente, serviços mais rentáveis e controle de inadimplência operacional.
                </p>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-6">Sincronização Direta</span>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900 border border-slate-800/80 p-8 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6">
                  <Megaphone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Marketing Automatizado</h3>
                <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                  Desenhe campanhas promocionais de fidelização baseadas em histórico de visitas. Disparador pronto de cupões de desconto para reativar clientes inativos.
                </p>
              </div>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mt-6">Aceleração de Vendas</span>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900 border border-slate-800/80 p-8 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-6">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Otimizador IA de Horários</h3>
                <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                  A nossa inteligência artificial inteligente sugere dinamicamente alterações de precificação e campanhas relâmpago baseadas no comportamento de procura regional.
                </p>
              </div>
              <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider mt-6">Tecnologia Inteligente</span>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-900 border border-slate-800/80 p-8 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Pagamento Online Integrado</h3>
                <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                  Aceite depósitos antecipados obrigatórios e cartões de crédito via Stripe para garantir a liquidez e proteger o seu estabelecimento contra desistências súbitas.
                </p>
              </div>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mt-6">Garantia Financeira</span>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-900 border border-slate-800/80 p-8 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-6">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Suporte Premium do Parceiro</h3>
                <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                  Linha de suporte prioritário dedicada. Ajudamos a importar a sua atual lista de clientes em menos de 24 horas para começar sem qualquer atrito técnico.
                </p>
              </div>
              <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider mt-6">Apoio Garantido</span>
            </div>

          </div>
        </div>
      </section>

      {/* Subscription Pricing Structure */}
      <section className="py-20 bg-slate-900/30 border-t border-b border-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-white tracking-tight">Vantagens SaaS Premium</h2>
          <p className="text-slate-400 text-sm mt-2">Dedilhado para acelerar e maximizar as oportunidades do seu estabelecimento.</p>

          <div className="mt-12 bg-slate-900 border border-slate-800 p-10 rounded-3xl max-w-md mx-auto relative overflow-hidden shadow-2xl">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-widest block">Licenciamento de Uso</span>
            <div className="mt-4 flex justify-center items-baseline mb-4">
              <span className="text-2xl font-black text-white">Configuração Sob Medida</span>
            </div>
            
            <p className="text-xs text-slate-400 mt-4 leading-normal">
              Teste gratuito configurável pelo administrador da plataforma. Obtenha controle profissional de agendamentos online imediatos.
            </p>

            <ul className="mt-8 space-y-3.5 text-left text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Gestão Completa de Calendário de Funcionários</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Cobranças online integradas via Stripe</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-rose-500 shrink-0" />
                <span>IA Assistente de Horários e Campanhas</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Fidelização e Disparo de Promoções automáticas</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Dashboard de Analytics Técnico em Tempo Real</span>
              </li>
            </ul>

            <Link
              to="/partner/signup"
              className="mt-10 block w-full text-center bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl transition-all font-sans text-xs cursor-pointer shadow-md shadow-rose-950"
            >
              Iniciar Cadastro Profissional
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 text-center max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Pronto para digitalizar o seu estabelecimento?</h2>
        <p className="text-slate-450 mt-3 text-slate-400 text-sm">
          Cadastre-se na Glamzo parceiros e mude a forma como os clientes encontram e agendam os seus serviços.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/partner/signup"
            className="w-full sm:w-auto bg-white hover:bg-slate-150 text-slate-950 font-bold px-8 py-3.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Criar Conta Profissional
          </Link>
          <Link
            to="/partner/login"
            className="w-full sm:w-auto text-slate-400 hover:text-white px-5 py-2 font-semibold text-xs cursor-pointer"
          >
            Fazer Login Profissional
          </Link>
        </div>
      </section>

    </div>
  );
}
