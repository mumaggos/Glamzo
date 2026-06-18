import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, User, Briefcase } from 'lucide-react';
import Footer from '../components/Footer';

const faqData = {
  'cliente': {
    title: 'Centro de Ajuda — Clientes',
    icon: User,
    description: 'Tudo o que precisa de saber para utilizar a Glamzo e encontrar os melhores salões.',
    items: [
      {
        q: 'Como posso reservar um serviço?',
        a: 'Para reservar, basta pesquisar pelo salão desejado, navegar pelo menu de serviços, escolher um ou mais itens e clicar em "Reservar". Em seguida, selecione o dia e o horário pretendidos e prossiga para o checkout seguro.'
      },
      {
        q: 'Como cancelar a minha marcação?',
        a: 'No painel "As Minhas Reservas" da sua conta, encontrará listados os seus agendamentos ativos. Selecione a marcação que deseja cancelar e clique no botão de cancelamento. Lembre-se, cancelamentos gratuitos exigem normalmente uma antecedência superior a 24 horas.'
      },
      {
        q: 'Como é feito o reembolso se o salão cancelar?',
        a: 'Se, por motivos de força maior, o estabelecimento cancelar a sua marcação online pré-paga, o sistema aciona de forma 100% automática a transferência reversa na Stripe sem custos (demora normalmente entre 2 e 5 dias).'
      },
      {
        q: 'Posso contactar o salão diretamente?',
        a: 'Sim. Em "Contactos do Salão" dentro da página do estabelecimento ou no Apoio por Mensagem na aba flutuante com o ecrã do salão selecionado, tem os detalhes diretos (WhatsApp e o nosso Mensageiro Interno).'
      },
      {
        q: 'Os profissionais vêem os dados do meu cartão?',
        a: 'Nunca. A Glamzo utiliza a Stripe, uma das infraestruturas mais seguras do mundo. Todos os processamentos são encriptados, nem nós nem os salões têm acesso ao número do seu cartão.'
      }
    ]
  },
  'parceiro': {
    title: 'Centro de Ajuda — Parceiros (Salões)',
    icon: Briefcase,
    description: 'Um guia inicial de operações para profissionais gerirem a página e agenda do salão.',
    items: [
      {
        q: 'Como recebo os pagamentos online?',
        a: 'A Glamzo usa a Stripe Express (Connect). Os pagamentos online debitados aos clientes vão diretos para a sua conta Stripe associada. O saldo transfere-se então via Payout automático (diário ou semanal) diretamente para o IBAN que inserir.'
      },
      {
        q: 'Como configuro o Stripe Connect na minha conta de negócios?',
        a: 'No seu Dashboard Admin, em "Pagamentos", tem um botão de "Associar Stripe". Este link redirecionado, 100% seguro da Stripe, pedir-lhe-á a confirmação de identidade jurídica / particular e do IBAN.'
      },
      {
        q: 'Posso adicionar empregados ao meu calendário?',
        a: 'Ainda em fase beta, a funcionalidade da Gestão de Equipa estará disponível durante as opções finais de negócio. Nesta versão todos os serviços bloqueiam a loja com 1 booking slot por tempo estipulado.'
      },
      {
        q: 'Como adicionar serviços, categorias e alterar preços?',
        a: 'Dentro do Painel Admin > "Serviços", tem controlo pleno sobre as suas categorias (Cabelo, Unhas, Massagens, etc), bem como em relação à fixação dos preços, tempo do serviço e publicações.'
      },
      {
        q: 'Fazem promoção às nossas lojas?',
        a: 'O sistema embutido das "Glamzo Promoted Shops" permite fixar temporariamente a sua loja no carrossel de capa e posições chave mediante destaque especial nos tarifários de subscrição Premium.'
      }
    ]
  }
};

export default function FaqPage() {
  const { type } = useParams();
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type]);

  const target = type && faqData[type as keyof typeof faqData] ? type : 'cliente';
  const data = faqData[target as keyof typeof faqData];

  const Icon = data.icon;

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col">
      <div className="flex-1 pt-24 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
        
        <div className="flex items-center gap-4 mb-2">
          <Link to="/" className="text-xs font-bold text-purple-600 uppercase tracking-widest hover:text-purple-700 transition-colors">
            ← Início
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">FAQS</span>
        </div>
        
        <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm mt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
              <Icon className="w-6 h-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-medium text-slate-900 tracking-tight">
              {data.title}
            </h1>
          </div>
          <p className="text-slate-500 mb-10 pb-8 border-b border-slate-100">{data.description}</p>
          
          <div className="space-y-3">
            {data.items.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <h3 className="font-bold text-slate-800 text-[15px]">{faq.q}</h3>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-100 align-super bg-slate-50/50 mt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-12 p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center">
            <p className="text-sm text-slate-600">Ainda com dúvidas? Fale connosco.</p>
            <a href="mailto:suporte@glamzo.pt" className="inline-flex items-center gap-2 px-5 py-2.5 mt-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl transition-all">
              <HelpCircle className="w-4 h-4" />
              Contactar Equipa
            </a>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
