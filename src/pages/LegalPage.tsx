import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, FileText, Lock, RefreshCcw, CreditCard, Cookie } from 'lucide-react';
import Footer from '../components/Footer';

const legalContent: Record<string, { title: string, icon: any, content: React.ReactNode }> = {
  'termos': {
    title: 'Termos e Condições',
    icon: FileText,
    content: (
      <div className="space-y-6 text-slate-600 leading-relaxed text-sm">
        <p>Estes Termos e Condições ("Termos") regem a utilização da plataforma Glamzo, incluindo o website e os serviços oferecidos. Ao aceder e utilizar a plataforma, concorda vincular-se a estes Termos.</p>
        
        <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">1. Descrição do Serviço</h3>
        <p>A Glamzo atua como uma plataforma de marcações (marketplace) que liga utilizadores (clientes) a profissionais e estabelecimentos de beleza e bem-estar (parceiros). Não prestamos serviços de beleza diretamente.</p>

        <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">2. Responsabilidades do Utilizador</h3>
        <p>Como utilizador, compromete-se a fornecer informações verdadeiras e exatas no momento do registo. Concorda também em comparecer aos serviços marcados ou cancelá-los com a devida antecedência (ver Política de Cancelamento).</p>

        <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">3. Responsabilidades dos Parceiros</h3>
        <p>Os Parceiros são inteiramente responsáveis pelos serviços que prestam, pelos preços que definem e pela exatidão das informações do seu perfil na plataforma.</p>

        <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">4. Pagamentos e Faturação</h3>
        <p>Os pagamentos processados pela Glamzo são realizados através do nosso parceiro Stripe. A Glamzo retém comissões conforme acordado com o parceiro. A emissão da fatura do prestador do serviço ao cliente final é da responsabilidade exclusiva do parceiro.</p>

        <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">5. Alterações aos Termos</h3>
        <p>A Glamzo reserva-se ao direito de atualizar estes termos a qualquer momento, sendo as alterações publicadas nesta página.</p>
      </div>
    )
  },
  'privacidade': {
    title: 'Política de Privacidade',
    icon: ShieldCheck,
    content: (
      <div className="space-y-6 text-slate-600 leading-relaxed text-sm">
        <p>A Glamzo está empenhada em proteger a sua privacidade. Esta Política de Privacidade explica como recolhemos, utilizamos, partilhamos e armazenamos as suas informações pessoais (dados).</p>

        <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">1. Dados Recolhidos</h3>
        <p>Recolhemos dados que nos fornece diretamente (como nome, endereço de e-mail, telefone) durante o registo e o processo de agendamento. Se escolher pagar online, processamos mas não armazenamos dados de pagamento (via Stripe).</p>

        <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">2. Utilização dos Dados</h3>
        <p>Os seus dados são utilizados para garantir as marcações, comunicar atualizações, e para personalizar e melhorar o serviço. Só partilhamos o seu nome e telefone com o salão parceiro selecionado para fins do agendamento.</p>

        <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">3. Conservação dos Dados</h3>
        <p>Os seus dados pessoais são mantidos enquanto a sua conta estiver ativa ou pelo tempo necessário para cumprir com as obrigações legais em vigor.</p>

        <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">4. Os seus Direitos</h3>
        <p>Nos termos do Regulamento Geral de Proteção de Dados (RGPD), os utilizadores podem solicitar o acesso, apagamento ou retificação dos seus dados, enviando e-mail para privacidade@glamzo.pt.</p>
      </div>
    )
  },
  'cookies': {
    title: 'Política de Cookies',
    icon: Cookie,
    content: (
      <div className="space-y-6 text-slate-600 leading-relaxed text-sm">
        <p>Utilizamos cookies e tecnologias semelhantes para garantir o correto funcionamento e melhorar a sua experiência na Glamzo.</p>

        <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">1. O que são Cookies?</h3>
        <p>Cookies são pequenos ficheiros de texto guardados pelo navegador no seu dispositivo. Não prejudicam o equipamento e ajudam o website a "lembrar" das suas ações.</p>

        <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">2. Tipos de Cookies que Usamos</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Cookies Estritamente Necessários:</strong> Fundamentais para podermos autenticar o seu login e processar marcações. Não podem ser desativados.</li>
          <li><strong>Cookies de Performance:</strong> Permitem-nos entender como navega e como podemos otimizar o site.</li>
          <li><strong>Cookies de Funcionalidade:</strong> Lembram as suas preferências (como a última cidade pesquisada).</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">3. Gestão de Cookies</h3>
        <p>Sempre que desejar pode, através do seu navegador web ou telemóvel, alterar as definições de cache e apagar os cookies.</p>
      </div>
    )
  },
  'cancelamentos': {
    title: 'Política de Cancelamentos',
    icon: RefreshCcw,
    content: (
      <div className="space-y-6 text-slate-600 leading-relaxed text-sm">
        <p>Para manter um ecossistema justo e evitar ausências injustificadas que prejudicam os nossos parceiros, implementámos regras estritas de alteração.</p>

        <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">1. Cancelamentos pelo Cliente</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Com mais de 24h de antecedência:</strong> Cancelamento gratuito através da Área de Cliente e reembolso total.</li>
          <li><strong>Com menos de 24h de antecedência:</strong> Dependendo do salão, pode ser cobrada uma taxa até 50% do valor do serviço.</li>
          <li><strong>No-show (Falta sem aviso):</strong> Pode ser cobrado o valor integral de 100% como penalização de tempo perdido pelo profissional.</li>
        </ul>

        <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">2. Cancelamentos pelo Salão</h3>
        <p>Se, de forma imprevista, o parceiro não puder prestar o serviço reservado, o cliente é notificado de imediato e o pagamento digital emitido será 100% devolvido à fonte sem taxa.</p>
      </div>
    )
  },
  'pagamentos': {
    title: 'Política de Pagamentos',
    icon: CreditCard,
    content: (
      <div className="space-y-6 text-slate-600 leading-relaxed text-sm">
        <p>A Glamzo recorre à <strong>Stripe Inc.</strong> (processador de pagamentos auditado globalmente e regulamentado) para transações seguras.</p>

        <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">1. Reservas Online (Pagamentos Pré-Aprovados)</h3>
        <p>Em alguns salões, poderá fazer o pagamento total através de Cartão de Crédito/Débito, Apple Pay, Google Pay ou MBWay (limitado por território). A plataforma nunca tem acesso aos seus dados de cartão.</p>

        <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">2. Pagar no Salão</h3>
        <p>Também disponibilizamos a modalidade Pagar no Local. O pagamento será feito presencialmente no dia. Contudo, em virtude da proteção de No-Show, o salão poderá no futuro exigir a adição de método de pagamento por garantia.</p>
      </div>
    )
  },
  'seguranca-rgpd': {
    title: 'Segurança e Dados (RGPD)',
    icon: Lock,
    content: (
      <div className="space-y-6 text-slate-600 leading-relaxed text-sm">
        <p>A confidencialidade, as comunicações encintadas e a aplicação da diretiva Europeia RGPD são compromissos obrigatórios na Glamzo.</p>
        
        <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">1. Conformidade RGPD</h3>
        <p>Os titulares dos dados têm o direito de revogar e eliminar completamente o seu Perfil. Para garantir a anonimização ou "Direito ao Esquecimento", utilize as opções da Minha Conta ou escreva-nos.</p>

        <h3 className="text-lg font-bold text-slate-800 mt-8 mb-4">2. Servidores e Base de Dados</h3>
        <p>Usamos datacenters sediados fisicamente na União Europeia em conformidade total. O armazenamento segue princípios baseados em permissões limitadas (Row-Level Security) na nossa base Supabase alojada globalmente por nós com chaves privadas não visíveis ao lado do cliente.</p>
      </div>
    )
  }
};

export default function LegalPage() {
  const { slug } = useParams();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const data = slug && legalContent[slug] ? legalContent[slug] : null;

  if (!data) {
    return (
      <div className="min-h-screen pt-24 bg-[#fafbfc] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">Página não encontrada</h2>
          <p className="text-slate-500">O documento que procura não existe ou foi movido.</p>
          <Link to="/" className="inline-block mt-4 px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold">Voltar ao Início</Link>
        </div>
      </div>
    );
  }

  const Icon = data.icon;

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col">
      <div className="flex-1 pt-24 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
        
        <Link to="/" className="inline-block text-xs font-bold text-purple-600 uppercase tracking-widest mb-6 hover:text-purple-700 transition-colors">
          ← Voltar à Pátio Principal
        </Link>
        
        <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-medium text-slate-900 tracking-tight">{data.title}</h1>
              <p className="text-sm text-slate-500 mt-1">Atualizado em: Junho de 2026</p>
            </div>
          </div>
          
          <article className="prose prose-slate max-w-none prose-p:text-slate-600 prose-headings:text-slate-800">
            {data.content}
          </article>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
