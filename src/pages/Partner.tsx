import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Calendar, Users, Smartphone, Globe, Megaphone, CheckCircle2, ArrowRight,
  TrendingUp, Star, Search, CreditCard, LayoutDashboard, Target
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
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-24">
      
      {/* Premium Hero */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur border border-white/20 rounded-full text-[10px] font-bold tracking-wider text-white mb-8 uppercase">
            <TrendingUp className="w-3 h-3 text-purple-400" />
            <span>Para Profissionais de Beleza</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight leading-tight mb-8">
            Mais clientes.<br/>
            <span className="text-purple-400 italic font-display">Mais reservas.</span><br/>
            Mais organização.
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-300 max-w-2xl mx-auto mb-10 font-medium">
            Junte-se à principal plataforma de beleza. Não vendemos apenas uma agenda. Entregamos crescimento real para o seu espaço.
          </p>

          <Link
            to="/partner/signup"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 px-8 py-4 rounded-full font-bold text-lg shadow-2xl transition-transform hover:scale-105"
          >
            Começar Gratuitamente <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Tudo o que precisa.</h2>
            <p className="text-lg text-slate-500">Numa única plataforma elegante e fácil de usar.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <FeatureCard 
              icon={<Search className="w-6 h-6 text-purple-600" />}
              title="Marketplace Glamzo"
              desc="Apareça para milhares de clientes que procuram serviços de beleza na sua zona todos os dias."
            />
            <FeatureCard 
              icon={<Calendar className="w-6 h-6 text-purple-600" />}
              title="Agenda Inteligente"
              desc="Gestão de marcações perfeita, sem conflitos. Lembretes automáticos para reduzir faltas."
            />
            <FeatureCard 
              icon={<CreditCard className="w-6 h-6 text-purple-600" />}
              title="Pagamentos Stripe"
              desc="Aceite pagamentos online, cobre sinais no ato da marcação e proteja-se contra não-comparências."
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-purple-600" />}
              title="Gestão de Equipa"
              desc="Horários, comissões, e agendas individuais. Cada profissional com o seu próprio acesso."
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6 text-purple-600" />}
              title="Website Próprio"
              desc="Um link de reservas exclusivo para o seu espaço, otimizado para o Google e partilha."
            />
            <FeatureCard 
              icon={<Target className="w-6 h-6 text-purple-600" />}
              title="Marketing & CRM"
              desc="Crie campanhas, envie descontos, e fidelize os seus melhores clientes automaticamente."
            />
            <FeatureCard 
              icon={<Smartphone className="w-6 h-6 text-purple-600" />}
              title="App Tablet & Mobile"
              desc="Gira o salão a partir do balcão com um iPad, ou no telemóvel quando estiver em movimento."
            />
            <FeatureCard 
              icon={<svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l8.29-8.29c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>}
              title="QR Code na Montra"
              desc="Receba um QR code elegante para colocar na porta. Clientes reservam 24/7."
            />
            <FeatureCard 
              icon={<Star className="w-6 h-6 text-purple-600" />}
              title="Integração Google"
              desc="Sincronize avaliações e apareça no Google Maps com o botão de 'Reservar'."
            />

          </div>
        </div>
      </section>

      {/* Visual Break / Dashboard Preview */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 to-transparent" />
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10">O centro de comando perfeito.</h2>
            <p className="text-slate-300 text-lg mb-12 relative z-10 max-w-2xl mx-auto">Desenvolvido com o feedback de centenas de profissionais para ser incrivelmente rápido e fácil de usar no dia a dia.</p>
            
            <div className="relative z-10 max-w-4xl mx-auto bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 aspect-video flex items-center justify-center">
              <LayoutDashboard className="w-24 h-24 text-slate-600" />
              <p className="absolute text-slate-500 font-medium mt-32">Preview da Interface</p>
            </div>
          </div>
        </div>
      </section>

      {/* Checklist */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-purple-50 rounded-3xl p-8 md:p-12 border border-purple-100 shadow-sm">
            <h3 className="text-2xl font-black text-slate-900 mb-8 text-center">Tudo Validado para o Sucesso</h3>
            
            <div className="space-y-4">
              <ChecklistItem text="Crescimento de novos clientes através do Marketplace" />
              <ChecklistItem text="Redução de faltas em 90% com lembretes e sinais" />
              <ChecklistItem text="Gestão de equipa simplificada e transparente" />
              <ChecklistItem text="Aumento do ticket médio com upsells online" />
              <ChecklistItem text="Controlo total sobre as suas finanças" />
              <ChecklistItem text="Presença digital premium sem esforço" />
            </div>

            <div className="mt-12 text-center">
              <Link
                to="/partner/signup"
                className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-transform hover:scale-105"
              >
                Criar Conta Gratuita <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-xs text-slate-500 mt-4">Configuração em 5 minutos. Sem cartões de crédito.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1">
      <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-purple-100/50 shadow-sm">
      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
      </div>
      <span className="font-bold text-slate-700 text-sm md:text-base">{text}</span>
    </div>
  );
}
