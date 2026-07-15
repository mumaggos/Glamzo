import React, { useState, useEffect } from 'react';
import UniversalInbox from '../components/UniversalInbox';
import UniversalDisputes from '../components/UniversalDisputes';
import SuperAdminClub from '../components/SuperAdminClub';
import SalesAgentsTab from '../components/SalesAgentsTab';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { optimizeImageBeforeUpload } from '../utils/imageOptimizer';
import { UserProfile, UserRole, Business } from '../types';
import { MAIN_CATEGORIES } from '../utils/categoriesData';
import { financeService } from '../utils/financeService';
import GlamzoLogo from '../components/GlamzoLogo';
import { sendAbandonedCartEmail } from '../utils/communicationHelper';
import { 
  Shield, Users, Search, MessageSquare, RefreshCw, AlertTriangle, ArrowUpRight, Check, 
  ShieldAlert, Loader2, Landmark, HelpCircle, Tag, Smartphone, CheckCircle, 
  Trash2, Award, Coins, Scale, Briefcase, BarChart, Settings, Mail, BadgeAlert, Sparkles, Plus,
  X, Calendar, Clock, MapPin, Globe, ExternalLink, Menu, FileText, LogOut
, CreditCard, ArrowRightLeft, Package } from 'lucide-react';
import { 
  BarChart as RBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart as RLineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';


const PAGE_FALLBACKS: Record<string, string> = {
  "termos-e-condicoes": "<p>\n            Bem-vindo à Glamzo. Estes Termos e Condições regem o acesso e a utilização do nosso marketplace e plataforma digital, concebidos para ligar clientes a profissionais e salões de beleza em Portugal e na União Europeia.\n          </p>\n\n      <h2>1. Utilização da Plataforma</h2>\n      <p>\n        O acesso e uso da Glamzo implicam a aceitação plena e sem reservas das presentes condições. A plataforma destina-se ao agendamento de serviços de beleza, estética e bem-estar, facilitando a interação entre Clientes (\"Utilizadores\") e Salões/Profissionais (\"Parceiros\").\n      </p>\n\n      <h2>2. Criação de Conta</h2>\n      <p>\n        Para efetuar marcações ou configurar um perfil de parceiro, o utilizador deverá criar uma conta. É responsável por manter a confidencialidade das suas credenciais (email e palavra-passe) geridas através do nosso fornecedor seguro de autenticação. É estritamente proibida a criação de contas com dados falsos.\n      </p>\n\n      <h2>3. Responsabilidade dos Salões (Parceiros)</h2>\n      <p>\n        Os Parceiros são inteiramente responsáveis pela veracidade e precisão da informação publicitada nos seus perfis, incluindo preçários, disponibilidade, morada e duração dos serviços. Os Parceiros comprometem-se a prestar os serviços aos Clientes com o mais alto padrão de profissionalismo e higiene, cumprindo a legislação laboral e sanitária aplicável.\n      </p>\n\n      <h2>4. Responsabilidade dos Clientes</h2>\n      <p>\n        Os Clientes comprometem-se a comparecer na hora e local indicados na sua marcação, respeitando as normas do estabelecimento do Parceiro. Devem garantir que os dados de pagamento utilizados nos métodos partilhados através do nosso processador Stripe são legítimos e têm os fundos necessários.\n      </p>\n\n      <h2>5. Pagamentos</h2>\n      <p>\n        Todos os pagamentos online são processados de forma segura pela Stripe e encaminhados via Stripe Connect quando aplicável. A Glamzo não armazena dados de cartões de crédito. Ao realizar uma marcação, o cliente aceita que a Glamzo poderá atuar como agente de cobrança em nome do Parceiro.\n      </p>\n\n      <h2>6. Cancelamentos e Reembolsos</h2>\n      <p>\n        As condições de cancelamento variam conforme as definições estipuladas por cada Parceiro no seu perfil. Por favor, consulte a nossa Política de Cancelamentos e Reembolsos para detalhes abrangentes sobre não comparências (\"no-shows\"), cancelamentos tardios e devolução de valores pré-pagos.\n      </p>\n\n      <h2>7. Conteúdo Publicado</h2>\n      <p>\n        As fotografias, descrições e avaliações inseridas pelos Utilizadores ou Parceiros devem respeitar as boas práticas de convivência e a legislação vigente. A Glamzo reserva-se o direito de remover qualquer conteúdo considerado difamatório, inadequado, ofensivo ou enganador.\n      </p>\n\n      <h2>8. Suspensão de Contas</h2>\n      <p>\n        Reservamo-nos o direito de suspender temporária ou definitivamente qualquer conta (Cliente ou Parceiro) que incumpra os presentes Termos, efetue ações fraudulentas ou cause prejuízos à Glamzo ou a terceiros.\n      </p>\n\n      <h2>9. Limitação de Responsabilidade</h2>\n      <p>\n        A Glamzo atua como um facilitador técnico e marketplace. Não prestamos diretamente os serviços de beleza. Deste modo, não nos responsabilizamos por falhas na execução do serviço, reações alérgicas, disputas entre o Cliente e o Parceiro ou alterações de última hora efetuadas pelas partes. Os Parceiros assumem responsabilidade integral pelos serviços prestados nas suas instalações.\n      </p>\n\n      <h2>10. Legislação Aplicável e Foro competente</h2>\n      <p>\n        Estes Termos e Condições são regulados pela lei Portuguesa. Para resolução de qualquer litígio resultante da interpretação ou execução dos presentes Termos, o foro competente será o Tribunal da Comarca de Lisboa, com renúncia a qualquer outro.\n      </p>",
  "politica-de-privacidade": "<p>\n            A proteção da sua privacidade é fundamental para a Glamzo. Esta Política de Privacidade explica como recolhemos, tratamos, protegemos e armazenamos os seus dados pessoais, em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD - Regulamento (UE) 2016/679).\n          </p>\n\n      <h2>1. Dados Recolhidos</h2>\n      <p>A Glamzo recolhe e processa as seguintes categorias de dados pessoais:</p>\n      <ul>\n        <li><strong>Dados de Identificação:</strong> Nome, apelido, e-mail e número de telefone (necessário para lembretes e autenticação).</li>\n        <li><strong>Dados de Perfil (Parceiros):</strong> Denominação social, NIF, morada física do espaço comercial, IBAN (através do Stripe Connect) e informações associadas à licença de funcionamento.</li>\n        <li><strong>Dados de Agendamento:</strong> Histórico de marcações efetuadas, serviços selecionados, horários, profissionais preferenciais e o histórico de faturação.</li>\n        <li><strong>Dados Técnicos e de Navegação:</strong> Endereço IP, tipo de dispositivo, navegador, páginas visitadas e tempos de sessão.</li>\n      </ul>\n\n      <h2>2. Finalidade do Tratamento</h2>\n      <p>Os seus dados são tratados com as seguintes finalidades:</p>\n      <ul>\n        <li>Facilitar as reservas e agendamentos de serviços.</li>\n        <li>Gerir contas de Cliente e contas de Parceiro.</li>\n        <li>Processar pagamentos e transferências financeiras (subscrições ou repasses de comissões).</li>\n        <li>Envio de notificações de transação (ex. confirmações de marcação, lembretes de calendário).</li>\n        <li>Melhorar continuamente a segurança e as funcionalidades da plataforma.</li>\n      </ul>\n\n      <h2>3. Base Legal</h2>\n      <p>\n        Processamos os seus dados com base no seu <strong>consentimento expresso</strong> (quando cria uma conta), na <strong>execução de um contrato</strong> (processamento do seu agendamento ou contrato de Parceiro) e para o cumprimento de <strong>obrigações legais</strong> e <strong>interesses legítimos</strong> da Glamzo na manutenção de segurança da infraestrutura.\n      </p>\n\n      <h2>4. Conservação dos Dados</h2>\n      <p>\n        Os dados pessoais serão retidos pelo período estritamente necessário para cumprir as finalidades indicadas. Dados fiscais e associados a faturação serão mantidos pelos prazos exigidos pela legislação fiscal Portuguesa (geralmente até 10 anos). Se eliminar a sua conta, os seus dados não essenciais são apagados ou devidamente anonimizados em 30 dias.\n      </p>\n\n      <h2>5. Serviços Terceiros Utilizados (Processadores de Dados)</h2>\n      <p>Para fornecer um serviço robusto e de alta escala, delegamos sub-processos especializados a plataformas que cumprem as exigências de tratamento de dados:</p>\n      <ul>\n        <li><strong>Supabase:</strong> A nossa base de dados primária e gestão de autenticação. Garante o isolamento de dados com políticas de acesso restritas e armazenamento encriptado, centralizado em servidores na União Europeia.</li>\n        <li><strong>Stripe:</strong> O processador exclusivo de pagamentos. Nenhum dado do seu cartão é armazenado nos nossos servidores (nem pelo Supabase ou Render). A Stripe processa cartões de crédito e as contas de payout de Parceiros (Stripe Connect).</li>\n        <li><strong>Render:</strong> Utilizamos a Render como plataforma estrutural (PaaS) que aloja as necessidades lógicas da app e serve pedidos com uma infraestrutura segura e encriptada.</li>\n      </ul>\n\n      <h2>6. Direitos GDPR (RGPD)</h2>\n      <p>Todos os utilizadores têm os seguintes direitos perante a nossa plataforma:</p>\n      <ul>\n        <li><strong>Direito de Acesso:</strong> Obter a confirmação sobre quais dados seus estão a ser processados.</li>\n        <li><strong>Direito de Retificação:</strong> Editar de forma livre no seu Perfil os seus dados caso estejam incorretos.</li>\n        <li><strong>Direito ao Apagamento (\"Direito a ser Esquecido\"):</strong> Exigir a eliminação permanente da sua conta e registos associados.</li>\n        <li><strong>Direito à Portabilidade:</strong> Obter uma cópia dos seus marcações e dados num formato digital estruturado.</li>\n      </ul>\n\n      <h2>7. Segurança e Proteção de Dados</h2>\n      <p>\n        Implementamos rigorosas práticas de segurança, como ligações encriptadas (HTTPS/TLS) por toda a nossa infraestrutura e garantimos separação relacional estrita entre os dados dos clientes e as infraestruturas dos salões (Row-Level Security) na nossa base de dados de produção.\n      </p>\n\n      <h2>8. Contacto para Proteção de Dados</h2>\n      <p>\n        Para qualquer dúvida relacionada com esta Política, para remover os seus dados, ou para o exercício dos seus direitos ao abrigo do RGPD, contacte a nossa equipa através de: <strong>glamzo.suporte@gmail.com</strong> com o assunto \"RGPD e Proteção de Dados\".\n      </p>",
  "politica-de-cookies": "<p>\n            Esta página descreve como a plataforma Glamzo utiliza \"cookies\" e tecnologia semelhante para disponibilizar a melhor experiência a Clientes e Parceiros.\n          </p>\n\n      <h2>1. O que são os Cookies?</h2>\n      <p>\n        Cookies são pequenos ficheiros de texto transferidos para o seu dispositivo eletrónico (computador, smartphone ou tablet) pelo seu navegador de internet, a pedido dos servidores da nossa plataforma. Servem para garantir e reter o funcionamento da navegação, manter o seu login e reter preferências.\n      </p>\n\n      <h2>2. Os Nossos Cookies Essenciais</h2>\n      <p>\n        Na Glamzo, focamo-nos em garantir a máxima rapidez, segurança e fiabilidade. São estritamente necessários para permitir-lhe navegar no website e aplicar as funcionalidades chave (exemplo, manter a sessão de Cliente iniciada enquanto seleciona um salão). \n        <strong>Não exigem consentimento, pois a plataforma não consegue operar sem eles.</strong>\n      </p>\n      <ul>\n        <li><strong>Autenticação Segura:</strong> Emitidos via Supabase, necessários para identificar o seu utilizador (sessão segura) para impedir acessos de terceiros.</li>\n        <li><strong>Processamento Seguro:</strong> Emitidos pelo Stripe enquanto está num fluxo de entrada de pagamentos (são cookies cruciais para as exigências bancárias e anti-fraude).</li>\n      </ul>\n\n      <h2>3. Cookies Analíticos e de Performance</h2>\n      <p>\n        (Aguardamos a sua conformidade via Banner de Consentimento) <br />\n        Para melhorar o layout dos nossos painéis de salões ou a experiência de pesquisa, poderemos pontualmente recolher dados orgânicos agregados e anónimos (taxas de cliques nalgum botão, rotas que quebram num erro), que ajudam diretamente a nossa equipa de engenharia a lançar novas versões livre de problemas.\n      </p>\n\n      <h2>4. Banner de Consentimento</h2>\n      <p>\n        Quando o utilizador visita a Glamzo pela primeira vez será notificado acerca desta configuração, permitindo a gestão em pleno e escolhendo bloquear a inserção dos de classe Analítica/Performance se assim o desejar.\n      </p>\n\n      <h2>5. Gestão de Cookies e Browser</h2>\n      <p>\n        A maioria dos navegadores (Google Chrome, Firefox, Safari) permitem total controlo sobre todos os cookies instalados, inclusivamente, limpar os persistentes. Pode revogar os cookies diretamente através das definições gerais de Privacidade do seu programa de navegação. \n      </p>",
  "politica-de-cancelamentos": "<p>\n            A Glamzo pretende proporcionar uma relação de compromisso e respeito entre todos os Clientes e Salões. A não comparência ou as alterações em cima da hora trazem perdas substanciais de rendimento aos Parceiros.\n          </p>\n\n      <h2>1. Regras para Clientes</h2>\n      <p>\n        Quando o Cliente agenda um serviço, o Parceiro bloqueia o tempo da sua agenda, impossibilitando que outros clientes tomem essa vaga. \n      </p>\n      <ul>\n        <li><strong>Cancelamentos Atempados:</strong> Geralmente, os clientes têm liberdade total para cancelar sua marcação online, de forma totalmente gratuita, e com reembolso a 100% (se pré-pago) desde que o façam fora da Janela de Tolerância estipulada.</li>\n        <li><strong>Janela de Tolerância:</strong> Cada salão parceiro tem a obrigatoriedade de decidir e exibir a sua própria política do limite horário (ex. cancelamento gratuito apenas até 24 ou 48 horas antes da sessão). Este limite é exibido claramente no momento do agendamento.</li>\n      </ul>\n\n      <h2>2. Cancelamentos Tardios e Não Comparência (\"No-Show\")</h2>\n      <p>\n        Caso um Cliente cancele depois de ultrapassada a Janela de Tolerância estabelecida pelo parceiro, ou em alternativa, caso o Cliente não compareça de todo no estabelecimento físico de marcação:\n      </p>\n      <ul>\n        <li>O Parceiro reserva-se ao direito de aplicar as multas protocolares, que podem variar de retenção parcial a retenção integral do valor do serviço acordado.</li>\n        <li>Se o pagamento não tiver ocorrido no momento da reserva (em pagamentos \"Pagamento no Local\"), a plataforma poderá solicitar e processar o cartão usado como caução (se exigido nas regras pré-acertadas do salão).</li>\n      </ul>\n\n      <h2>3. Regras e Garantias de Parceiros</h2>\n      <p>\n        Apesar de infrequentes, os Parceiros podem deparar-se com contratempos graves de gestão ou motivo de força maior, sendo obrigados a cancelar uma marcação do seu lado.\n      </p>\n      <ul>\n        <li>O Cliente que for alvo de um cancelamento por intervenção da parte exclusiva de um profissional será reembolsado na totalidade ou reagendado sob comum acordo.</li>\n        <li>Os Parceiros comprometem-se a comunicar com bastante antecedência qualquer eventual problema mecânico ou laboral para minimizar incómodos.</li>\n      </ul>\n\n      <h2>4. Reembolsos</h2>\n      <p>\n        Quaisquer fundos elegíveis a retornar para a conta do Cliente, por falha, por cancelamento atempado ou recusa do Salão, serão devolvidos, via Stripe, num prazo temporal normal estimado que os bancos exigem e determinam (regra geral entre 3 a 10 dias úteis diretos para o IBAN / Cartão usado no pagamento). A Glamzo emitirá as ordens de retorno de fundos prontamente.\n      </p>",
  "politica-de-pagamentos": "<p>\n            A Glamzo compromete-se com a fiabilidade absoluta em cada transação financeira gerada nas reservas comerciais, nas subscrições de aluguer da plataforma e no processamento de repasses de saldo às faturas dos Parceiros.\n          </p>\n\n      <h2>1. Pagamentos Processados pela Stripe</h2>\n      <p>\n        Para assegurar total segurança nas redes de débito e crédito, implementamos as redes de pagamentos da Stripe, Lda. Ao transacionar através da Plataforma (ex: inserir cartões, criar subscrições), estará subordinado obrigatoriamente às políticas europeias e regras de processamento e segurança garantidas pela Stripe.\n      </p>\n\n      <h2>2. Comissões da Plataforma</h2>\n      <p>\n        No modelo original (sem subscrição), a Glamzo aplica percentagens unitárias ou comissões mínimas de taxa administrativa por cada agendamento trazido e faturado na porta de um parceiro. Estas comissões aplicam-se apenas e de modo isolado contra o saldo credor faturado em nome dos Parceiros Comerciais; os Clientes apenas pagam o preço exato listado para os seus serviços desejados. \n      </p>\n\n      <h2>3. Subscrições Glamzo PRO</h2>\n      <p>\n        Os Parceiros dispõem ainda de uma modalidade alternativa por Subscrição (Glamzo PRO). Nesse modelo:\n      </p>\n      <ul>\n        <li>O Parceiro paga mensal ou anualmente um valor base predefinido que o isenta de uma maior incidência sobre comissões avulsas, ideal para grandes faturamentos em Salões de dimensão elevada.</li>\n        <li>O cancelamento das subscrições por parte do Parceiro deve ocorrer até ou antes do termo do tempo remanescente da mensalidade já paga, para bloquear a faturação de continuidade antes do período de auto-renovação.</li>\n      </ul>\n\n      <h2>4. Falhas de Pagamento</h2>\n      <p>\n        Se um processamento ou a validade mensal da Stripe ditar e intercetar insuficiência de saldo, bloqueio na entidade bancária e impossibilidade de recuo de uma subscrição recorrente: \n        <br />\n        O perfil profissional do parceiro na Glamzo poderá ficar restrito a reservas externas online para com o público geral até regularização e preenchimento atualizado em \"Faturação e Métodos de Pagamento\".\n      </p>\n\n      <h2>5. Faturação e Repasses de Salão</h2>\n      <p>\n        Todos os repasses e valores apurados retidos para entregar são processados pela plataforma Stripe Connect e diretamente redigidos, libertados ou depositados para a conta IBAN autorizada nas definições do Painel do Salão.\n      </p>",
  "seguranca-e-protecao-de-dados": "<p>Conteúdo padrão em falta.</p>",
  "faq-cliente": "<p>Bem-vindo à área de ajuda rápida ao cliente. Encontre abaixo as soluções e instruções mais solicitadas.</p>\n\n      <h2>1. Como fazer uma marcação?</h2>\n      <p>\n        Pode iniciar navegando pelas listas segmentadas das áreas de estéticas localizadas perto da área da sua localidade no nosso explorador da página principal (\"Encontrar Salões\"). Selecionará após a decisão do local a lista preçário de catálogo pretendido, depois avançará até uma data calendário do funcionário apto com hora exata acordada e findará o processamento no Checkout seguro ao finalizar o carrinho.\n      </p>\n\n      <h2>2. Posso efetuar cancelamentos após pagar?</h2>\n      <p>\n        Totalmente. Dentro dos dias do painel (Exemplo: 48 horas protetivas das regras acordadas no Salão de beleza em si) deve clicar no ícone do Utilizador (cimo do painel com sua foto de perfil), em \"Os Meus Agendamentos\", selecione e confirme sob a modalidade da opção visual de \"Cancelar\" reserva na própria interface da app.\n      </p>\n      \n      <h2>3. Os meus dados de pagamento estão em risco? Como pagar?</h2>\n      <p>\n        Para confirmar uma reserva paga adiantada utilizamos um dos maiores provedores da internet (Stripe), a sua segurança sobre pagamento é intransponível (CVC e chaves creditícias não tocam nos servidores de base de dados geridos por nós na Render / Supabase). A interface apresenta MBWAY (exibido na Stripe a nível europeu sob Multibanco/SEPA, caso abrangente pela região) ou uso tradicional dos seus cartões de crédito/débito. \n      </p>\n\n      <h2>4. Como posso contactar o salão antes do compromisso?</h2>\n      <p>\n        O perfil singular de cada loja / negócio (visualizável no portfólio de exploração ou até mesmo na fatura dos seus emails interativos de pós-processamento) dispões de toda a estrutura pública preenchida por esse mesmo negócio (Números Tlm., descrições e Localidade Geográfica para rotas e conversas com a gerência do espaço físico). Pode, contudo, também resolver tudo com a Glamzo!\n      </p>",
  "faq-parceiro": "<p>O centro e apoio dos Parceiros e Profissionais. Toda a informação técnica e base simplificada em prol da modernização das vossas atividades.</p>\n\n      <h2>1. Como aderir à rede da Glamzo?</h2>\n      <p>\n        Basta registar-se ou assinar enquanto Salão na via principal de acesso para Parceiros. Irá deparar-se com um pequeno assistente que requer os pormenores básicos fundamentais sobre a legalidade da sua loja, e logo será inserido de modo instantâneo dentro da comunidade comercial pronta a listar horários de catálogo.\n      </p>\n\n      <h2>2. Como funcionam os repasses e transações bancárias (Quando recebo)?</h2>\n      <p>\n        Os repasses (pagamentos totais consolidados para a sua conta do Salão resultantes do pagamento do cliente online através dos parceiros Stripe Connect) são de gestão integral pelo Painel Parceiro no \"Módulo Faturação\", onde introduz o seu aspeto legal do seu proprietariado. Os depósitos na conta configuradas ocorrem habitualmente num enquadramento automatizado num tempo exato de 3 dias a 7 úteis, a combinar e ditar das diretrizes bancárias vigentes na norma europeia atual.\n      </p>\n\n      <h2>3. Glamzo PRO. Em que se baseia a comissão subscrita?</h2>\n      <p>\n        Pode gerir um modelo mais básico com a Glamzo (comissões fracionadas em função das entradas individuais da clientela), de outro lado se as transações de grande volume de reservas compensar ao Seu Salão uma anuidade / mensalidade fixa, onde poupa nestas comissões independentes em troca dum selo Premium com destaque de perfil, estará também disponível o selo (PRO) atualizável a qualquer altura pelo portal Administrativo!\n      </p>\n\n      <h2>4. Obter suporte avançado para Partner ou de Faturações Específicas</h2>\n      <p>\n        Caso presencie dificuldades da base técnica, necessite pedir estornos pontuais complexos do lado da gestão, sinta falta do repórter de faturas e pagamentos de apoio ou qualquer assunto jurídico das marcações na conta profissional, abra ticket do modelo ou contacte as frentes base: <strong>glamzo.suporte@gmail.com</strong>\n      </p>",
  "sobre-nos": "<p className=\"lead text-xl text-slate-700 font-medium pb-4\">\n            A Glamzo é o seu novo ponto de encontro para a centralização ibérica (Portugal e UE) de beleza, bem-estar e gestão sofisticada de marcações para Salões premium.\n          </p>\n\n      <h2>O que fazemos</h2>\n      <p>\n        Operamos um mercado e plataforma robusta baseada em nuvem, concebidos especificamente para facilitar o contacto logístico sem fricção entre um Cliente focado nas marcações diárias e o negócio dinâmico pronto a acecionar valor, modernizando os espaços estéticos físicos das agendas arcaicas por cadernos e telefonemas de barulhos sem parar.\n      </p>\n\n      <h2>Benefícios</h2>\n      <ul>\n        <li>\n          <strong>Para Clientes:</strong> Agendamentos 24 horas por dia, 7 dias por semana onde encontram de forma clara todas as avaliações, horários certos e o melhor portfólio dos Salões de modo desocupado e unificado em dispositivos móveis.\n        </li>\n        <li>\n          <strong>Para Salões e Profissionais:</strong> Automações automáticas dos funis de controlo. Desde redução brutal das falhas e 'no-shows' não pagos, lembretes informáticos do controlo diário em e-mail / mensagens, uma simplificação imensa na hora repassar os valores Stripe aos próprios bancos (via subscrições ou comissões). \n        </li>\n      </ul>\n\n      <h2>A Nossa Missão, Visão e Valores (Comunidade)</h2>\n      <p>\n        <strong>A Missão:</strong> Acabar de uma vez com o constrangimento logístico de perdas de tempo nos telefones na altura de marcar horas. A Glamzo empodera o empreendedor logístico da beleza a modernizar sem um orçamento louco. \n      </p>\n      <p>\n        <strong>A Visão corporativa:</strong> Consolidar os nossos polos num único sistema moderno que dominará o aspeto comercial ibérico, focando primeiramente Portugal.\n      </p>\n      <p>\n        <strong>Valores Humanos:</strong> Construímos laços reais com negócios reais. A Glamzo opera de maneira não focada só num negócio empresarial hostil sem presença: mantemos um estilo de comunicação quente, moderno e português focado no suporte contínuo dos Profissionais.\n      </p>\n\n      <h2>Tecnologia e Segurança (Dados / Pagamentos)</h2>\n      <p>\n        O nosso ecossistema moderno encontra-se desenhado nas tecnologias da vanguarda da geração. Da Base da Nuvem Supabase, às plataformas logísticas em Render até aos circuitos monetários criptográfricos do PCI-Compliance interconectados no portal mundial da Stripe, a sua navegação, a visualização da privacidade, e inserção do cartão bancário desfruta exatamente do nível mais apetrechado no panorama global para blindar o conforto de Clientes e Parceiros.\n      </p>"
};

export default function Admin() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Active sub-tab configuration
  const [activeTab, setActiveTab] = useState<'users' | 'payouts' | 'support' | 'terminal' | 'analytics' | 'cms' | 'partners' | 'pages' | 'funnel' | 'club' | 'sales_teams'>('users');

  // Core database tables states
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [salons, setSalons] = useState<Business[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  
  // Custom operational state extensions (local state backup for unrepresented databases features)
  const [disputes, setDisputes] = useState<any[]>([]);
  const [adminNotes, setAdminNotes] = useState<{[key: string]: string}>({});
  const [couponsList, setCouponsList] = useState<any[]>(() => financeService.getAdminCoupons());

  // Coupon creator state
  const [couponCode, setCouponCode] = useState('PROMO30');
  const [couponDiscount, setCouponDiscount] = useState(19.90);
  const [couponDuration, setCouponDuration] = useState(45); // 45 days free trial
  const [couponLimit, setCouponLimit] = useState(25);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    financeService.createAdminCoupon(
      couponCode.trim().toUpperCase(),
      couponDiscount,
      'percent',
      couponLimit,
      couponDuration
    );

    setSuccessMsg(`Cupão ${couponCode.toUpperCase()} criado com sucesso! Lojistas podem utilizá-lo para ativar testes de ${couponDuration} dias.`);
    setCouponsList(financeService.getAdminCoupons());
    setCouponCode('');
  };

    const [supportChats, setSupportChats] = useState<any[]>([]);
  const [supportSubTab, setSupportSubTab] = useState<'messages' | 'disputes'>('messages');
  const [selectedSupportUser, setSelectedSupportUser] = useState<any>(null);
  const [supportInput, setSupportInput] = useState("");
  const [terminalRequests, setTerminalRequests] = useState<any[]>([
    { id: 'term-r01', salon: 'Luxe Nails Porto', city: 'Porto', status: 'pending_deposit', serial: 'GZ-TERM-90218' },
    { id: 'term-r02', salon: 'Barbearia da Linha', city: 'Cascais', status: 'shipped', serial: 'GZ-TERM-80125' }
  ]);
  const [terminalFilter, setTerminalFilter] = useState<'all' | 'awaiting_shipment'>('all');

  // Loading states
  const [loading, setLoading] = useState(false);
  const [sendingEmails, setSendingEmails] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isMobileAdminSidebarOpen, setIsMobileAdminSidebarOpen] = useState(false);

  // Allocations parameters
  const [pointsAllocUserId, setPointsAllocUserId] = useState<string | null>(null);
  const [pointsAllocVal, setPointsAllocVal] = useState<number>(100);

  // User edit modal state fields
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState<UserRole>('customer');

  // Salon edit modal state fields
  const [editingSalon, setEditingSalon] = useState<Business | null>(null);
  const [editSalonName, setEditSalonName] = useState('');
  const [editSalonCategory, setEditSalonCategory] = useState('');
  const [editSalonPhone, setEditSalonPhone] = useState('');
  const [editSalonCity, setEditSalonCity] = useState('');
  const [editSalonDistrict, setEditSalonDistrict] = useState('');
  const [editSalonAddress, setEditSalonAddress] = useState('');
  const [editSalonDescription, setEditSalonDescription] = useState('');

  // CMS Homepage states
  const [homepageCards, setHomepageCards] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [cmsTitle, setCmsTitle] = useState('');
  const [cmsSubtitle, setCmsSubtitle] = useState('');
  const [cmsImageUrl, setCmsImageUrl] = useState('');
  const [cmsDisplayOrder, setCmsDisplayOrder] = useState(1);
  const [cmsActive, setCmsActive] = useState(true);
  const [cmsEmoji, setCmsEmoji] = useState('✨');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [isUploadingCmsImage, setIsUploadingCmsImage] = useState(false);
  const [cmsError, setCmsError] = useState<string | null>(null);

  const fetchHomepageCards = async () => {
    setLoadingCards(true);
    setCmsError(null);
    try {
      const { data, error } = await supabase
        .from('homepage_cards')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) {
        if (error.code === '42P01') { 
          console.warn("Table homepage_cards does not exist in Supabase yet.");
          setCmsError("A tabela 'homepage_cards' ainda não existe na sua base de dados do Supabase. Por favor, execute a query SQL fornecida abaixo no SQL Editor do seu painel Supabase para criá-la!");
        } else {
          setCmsError(error.message);
        }
      } else {
        setHomepageCards(data || []);
      }
    } catch (err: any) {
      setCmsError(err.message || "Erro de conexão ao carregar cartões.");
    } finally {
      setLoadingCards(false);
    }
  };

  const fetchPlatformPages = async () => {
    setPagesError(null);
    try {
      const { data, error } = await supabase
        .from('platform_pages')
        .select('*');
      if (error) {
        if (error.code === '42P01') { 
          setPagesError("A tabela 'platform_pages' ainda não existe na base de dados. Execute o setup no SQL Editor.");
        } else {
          setPagesError(error.message);
        }
      } else {
        setPlatformPages(data || []);
      }
    } catch (err: any) {
      setPagesError(err.message || "Erro de conexão ao carregar páginas.");
    }
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPageSlug || !pageDraftTitle || !pageDraftContent) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('platform_pages')
        .upsert({
          slug: editingPageSlug,
          title: pageDraftTitle,
          content: pageDraftContent,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSuccessMsg("Página atualizada com sucesso!");
      setEditingPageSlug(null);
      setPageDraftTitle('');
      setPageDraftContent('');
      fetchPlatformPages();
    } catch (err: any) {
      setErrorMsg(`Erro ao guardar página: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'cms') {
      fetchHomepageCards();
    }
    if (activeTab === 'pages') {
      fetchPlatformPages();
    }
  }, [activeTab]);

  const handleSaveCmsCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setCmsError(null);
    if (!cmsTitle.trim() || !cmsSubtitle.trim()) {
      setCmsError("Por favor, preencha o título e o subtítulo do cartão.");
      return;
    }

    const payload = {
      title: cmsTitle.trim(),
      subtitle: cmsSubtitle.trim(),
      image_url: cmsImageUrl.trim() || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=70',
      display_order: Number(cmsDisplayOrder),
      active: cmsActive,
      emoji: cmsEmoji.trim() || '✨',
      updated_at: new Date().toISOString()
    };

    setLoadingCards(true);
    try {
      if (editingCardId) {
        const { error } = await supabase
          .from('homepage_cards')
          .update(payload)
          .eq('id', editingCardId);
        if (error) throw error;
        setSuccessMsg("Cartão da homepage atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from('homepage_cards')
          .insert([payload]);
        if (error) throw error;
        setSuccessMsg("Cartão da homepage criado com sucesso!");
      }

      // Reset form
      setCmsTitle('');
      setCmsSubtitle('');
      setCmsImageUrl('');
      setCmsDisplayOrder(homepageCards.length + 2);
      setCmsActive(true);
      setCmsEmoji('✨');
      setEditingCardId(null);
      fetchHomepageCards();
    } catch (err: any) {
      setCmsError(err.message || "Falha ao gravar cartão.");
    } finally {
      setLoadingCards(false);
    }
  };

  const handleEditCmsCard = (card: any) => {
    setEditingCardId(card.id);
    setCmsTitle(card.title || '');
    setCmsSubtitle(card.subtitle || '');
    setCmsImageUrl(card.image_url || '');
    setCmsDisplayOrder(card.display_order || 1);
    setCmsActive(card.active !== false);
    setCmsEmoji(card.emoji || '✨');
    setCmsError(null);
  };

  const handleDeleteCmsCard = async (cardId: string) => {
    if (!confirm("Tem a certeza que deseja eliminar este cartão?")) return;
    setLoadingCards(true);
    setCmsError(null);
    try {
      const { error } = await supabase
        .from('homepage_cards')
        .delete()
        .eq('id', cardId);
      if (error) throw error;
      setSuccessMsg("Cartão de destaque eliminado.");
      fetchHomepageCards();
    } catch (err: any) {
      setCmsError(err.message || "Erro ao eliminar.");
    } finally {
      setLoadingCards(false);
    }
  };

  const handleCmsImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCmsImage(true);
    setCmsError(null);

    try {
      // Direct WebP browser-side optimization & compression
      const optimized = await optimizeImageBeforeUpload(file);
      const filePath = `homepage/cms-${Date.now()}.webp`;

      const { data, error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(filePath, optimized.blob, {
          cacheControl: 'public, max-age=31536000, stale-while-revalidate=86400, immutable',
          contentType: 'image/webp',
          upsert: true,
        });

      if (uploadErr) {
        throw new Error(uploadErr.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setCmsImageUrl(publicUrl);
      setSuccessMsg("Upload de imagem efetuado com sucesso!");
    } catch (err: any) {
      setCmsError(`Erro no upload: ${err.message}. Pode alternativamente preencher o campo URL da imagem.`);
    } finally {
      setIsUploadingCmsImage(false);
    }
  };

  const handleMoveOrder = async (card: any, direction: 'up' | 'down') => {
    const nextOrder = direction === 'up' ? card.display_order - 1 : card.display_order + 1;
    setLoadingCards(true);
    try {
      const { error } = await supabase
        .from('homepage_cards')
        .update({ display_order: nextOrder })
        .eq('id', card.id);
      if (error) throw error;
      fetchHomepageCards();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingCards(false);
    }
  };

  // States to view all details of a salon inserted by the shop
    const [selectedSalon, setSelectedSalon] = useState<Business | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [eliteTab, setEliteTab] = useState<'overview' | 'stripe' | 'catalog' | 'edit'>('overview');
  const [selectedSalonServices, setSelectedSalonServices] = useState<any[]>([]);
  const [selectedSalonStaff, setSelectedSalonStaff] = useState<any[]>([]);
  const [selectedSalonHours, setSelectedSalonHours] = useState<any[]>([]);
  const [loadingSalonDetails, setLoadingSalonDetails] = useState<boolean>(false);

  // Load subtable details of the selected salon whenever it changes
  useEffect(() => {
    if (!selectedSalon) {
      setSelectedSalonServices([]);
      setSelectedSalonStaff([]);
      setSelectedSalonHours([]);
      return;
    }

    const fetchSalonSubDetails = async () => {
      setLoadingSalonDetails(true);
      try {
        const [
          { data: servs },
          { data: staf },
          { data: hours }
        ] = await Promise.all([
          supabase.from('services').select('*, category:service_categories(*)').eq('business_id', selectedSalon.id),
          supabase.from('staff').select('*').eq('business_id', selectedSalon.id),
          supabase.from('business_hours').select('*').eq('business_id', selectedSalon.id).order('weekday', { ascending: true })
        ]);

        setSelectedSalonServices(servs || []);
        setSelectedSalonStaff(staf || []);
        setSelectedSalonHours(hours || []);
      } catch (err) {
        console.error("Error loading salon detailed records:", err);
      } finally {
        setLoadingSalonDetails(false);
      }
    };

    fetchSalonSubDetails();
  }, [selectedSalon]);

  // Sync and fetch actual admin dashboards from database
  const [platformPages, setPlatformPages] = useState<any[]>([]);
  const [editingPageSlug, setEditingPageSlug] = useState<string | null>(null);
  const [pageDraftTitle, setPageDraftTitle] = useState('');
  const [pageDraftContent, setPageDraftContent] = useState('');
  const [pagesError, setPagesError] = useState<string | null>(null);

  const syncAdminDatasets = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      // Load concurrent actual production tables
      const [
        { data: profData, error: profErr },
        { data: salData, error: salErr },
        { data: payData, error: payErr },
        { data: billsData }
      ] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('businesses').select('*').order('created_at', { ascending: false }),
        supabase.from('payouts').select('*, business:businesses(*)').order('created_at', { ascending: false }),
        supabase.from('payments').select('*, business:businesses(*)')
      ]);

      if (profErr) throw profErr;
      if (salErr) throw salErr;
      if (payErr) throw payErr;

      setProfiles(profData || []);
      setSalons(salData || []);
      
      // Fetch and map tablet_orders from database
      try {
        const { data: ordsData, error: ordsErr } = await supabase
          .from('tablet_orders')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (ordsErr) {
          console.warn('Error fetching tablet_orders, falling back:', ordsErr);
          throw ordsErr;
        }

        if (ordsData && ordsData.length > 0) {
          const mappedOrders = ordsData.map((order: any) => {
            const salonMatch = (salData || []).find((s: any) => s.id === order.business_id);
            return {
              id: order.id,
              business_id: order.business_id,
              salon: salonMatch ? salonMatch.name : 'Desconhecido',
              city: order.shipping_city || (salonMatch ? salonMatch.city : '---'),
              shipping_name: order.shipping_name,
              shipping_phone: order.shipping_phone,
              shipping_address: order.shipping_address,
              shipping_postal_code: order.shipping_postal_code,
              deposit_paid: order.deposit_paid === true,
              carrier: order.carrier,
              tracking_code: order.tracking_code,
              status: order.status
            };
          });
          setTerminalRequests(mappedOrders);
        } else {
          setTerminalRequests([]);
        }
      } catch (err) {
        setTerminalRequests([]);
      }
      
      // Merge with financeService localized requests
      const localRequests = financeService.getPayouts().filter(p => !payoutRequests.some(pr => pr.id === p.id));
      setPayoutRequests([...(payData || []), ...localRequests]);
      
      if (billsData && billsData.length > 0) {
        setPaymentsList(billsData);
      } else {
        setPaymentsList([]);
      }

                  // Fetch disputes
      try {
        const { data: disputesData, error: disputesErr } = await supabase
          .from('disputes')
          .select('*, bookings(*), profiles!user_id(id, full_name, email, phone), businesses(id, name, phone, email)')
          .order('created_at', { ascending: false });

        if (!disputesErr && disputesData) {
          setDisputes(disputesData);
        }
      } catch (err) {
        console.warn('Fallback: Unable to fetch disputes', err);
      }
      
      

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Falha ao sincronizar lote ativo de faturamento e utilizadores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && profile && (profile.role === 'admin' || user.email === 'admin@gmail.com' || user.email === 'glamzo.suporte@gmail.com')) {
      syncAdminDatasets();
    }
  }, [user, profile]);

  // --- GESTÃO DE PARCEIROS ACTIONS & MODAL STATES ---
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
  const [deleteAccountTarget, setDeleteAccountTarget] = useState<{ ownerId: string; businessId: string; name: string } | null>(null);
  const [deleteAccountDoubleConfirmText, setDeleteAccountDoubleConfirmText] = useState('');

  const handleActivateProManual = async (businessId: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const { error: bizErr } = await supabase
        .from('businesses')
        .update({
          subscription_status: 'active',
          subscription_active: true
        })
        .eq('id', businessId);
      
      if (bizErr) throw bizErr;

      const { data: currentSpecs } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('business_id', businessId)
        .maybeSingle();

      if (currentSpecs) {
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            plan_name: 'PRO',
            expires_at: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()
          })
          .eq('id', currentSpecs.id);
      } else {
        await supabase
          .from('subscriptions')
          .insert({
            business_id: businessId,
            plan_name: 'PRO',
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
            monthly_price: 19.90
          });
      }

      setSuccessMsg("Plano GLAMZO PRO ativado manualmente com sucesso!");
      await syncAdminDatasets();
    } catch (err: any) {
      setErrorMsg(`Erro ao ativar PRO: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProManual = async (businessId: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const { error: bizErr } = await supabase
        .from('businesses')
        .update({
          subscription_status: 'inactive',
          subscription_active: false
        })
        .eq('id', businessId);
      
      if (bizErr) throw bizErr;

      await supabase
        .from('subscriptions')
        .update({ status: 'inactive' })
        .eq('business_id', businessId);

      setSuccessMsg("Plano GLAMZO PRO descontinuado manualmente. Salão revertido para FREE.");
      await syncAdminDatasets();
    } catch (err: any) {
      setErrorMsg(`Erro ao remover PRO: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmShipment = async (orderId: string, customCarrier?: string, customTracking?: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const finalCarrier = customCarrier || (document.getElementById(`carrier-${orderId}`) as HTMLInputElement)?.value || 'CTT';
      const finalTracking = customTracking || (document.getElementById(`tracking-${orderId}`) as HTMLInputElement)?.value || '';

      if (!finalTracking.trim()) {
        setErrorMsg('Por favor, introduza o Código de Rastreio (Tracking Code) antes de confirmar o envio.');
        setLoading(false);
        return;
      }

      // Update in Supabase
      const { error: updateErr } = await supabase
        .from('tablet_orders')
        .update({
          status: 'shipped',
          carrier: finalCarrier,
          tracking_code: finalTracking,
          shipped_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateErr) {
        // If updating a fallback item (id starts with term-r), simulate success in state
        if (typeof orderId === 'string' && orderId.startsWith('term-r')) {
          setTerminalRequests(prev => prev.map(tr => tr.id === orderId ? { ...tr, status: 'shipped', carrier: finalCarrier, tracking_code: finalTracking } : tr));
          setSuccessMsg(`[Simulação] Envio do tablet confirmado! Transportadora: ${finalCarrier}, Tracking: ${finalTracking}. E-mail automático de aviso enviado ao parceiro.`);
          setLoading(false);
          return;
        }
        throw updateErr;
      }

      // Trigger automatic e-mail notice simulated flow
      try {
        await fetch('/api/notifications/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            status: 'shipped',
            carrier: finalCarrier,
            trackingCode: finalTracking,
            message: 'O seu Glamzo Terminal foi enviado via CTT!'
          })
        });
      } catch (_) {}

      setSuccessMsg(`Envio do tablet confirmado com sucesso! Transportadora: ${finalCarrier}, Tracking: ${finalTracking}. Parceiro notificado por e-mail.`);
      await syncAdminDatasets();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Falha ao confirmar envio do tablet: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const { error: updateErr } = await supabase
        .from('tablet_orders')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateErr) {
        if (typeof orderId === 'string' && orderId.startsWith('term-r')) {
          setTerminalRequests(prev => prev.map(tr => tr.id === orderId ? { ...tr, status: 'delivered' } : tr));
          setSuccessMsg(`[Simulação] Tablet marcado como entregue com sucesso.`);
          setLoading(false);
          return;
        }
        throw updateErr;
      }

      setSuccessMsg(`Tablet marcado como entregue com sucesso.`);
      await syncAdminDatasets();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Falha ao marcar tablet como entregue: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendPartner = async (businessId: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const { error: bizErr } = await supabase
        .from('businesses')
        .update({
          subscription_status: 'suspended',
          subscription_active: false
        })
        .eq('id', businessId);
      
      if (bizErr) throw bizErr;

      await supabase
        .from('subscriptions')
        .update({ status: 'suspended' })
        .eq('business_id', businessId);

      setSuccessMsg("Loja suspensa com sucesso! O salão foi ocultado e o respetivo painel está bloqueado.");
      await syncAdminDatasets();
    } catch (err: any) {
      setErrorMsg(`Erro ao suspender parceiro: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReactivatePartner = async (businessId: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const { error: bizErr } = await supabase
        .from('businesses')
        .update({
          subscription_status: 'active',
          subscription_active: true
        })
        .eq('id', businessId);
      
      if (bizErr) throw bizErr;

      await supabase
        .from('subscriptions')
        .update({ status: 'active' })
        .eq('business_id', businessId);

      setSuccessMsg("Loja reativada com sucesso! Voltou à visibilidade pública.");
      await syncAdminDatasets();
    } catch (err: any) {
      setErrorMsg(`Erro ao reativar parceiro: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetTrial = async (businessId: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const newTrialEnds = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString();
      const { error: bizErr } = await supabase
        .from('businesses')
        .update({
          subscription_status: 'trialing',
          subscription_active: true,
          trial_ends_at: newTrialEnds
        })
        .eq('id', businessId);
      
      if (bizErr) throw bizErr;

      const { data: currentSpecs } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('business_id', businessId)
        .maybeSingle();

      if (currentSpecs) {
        await supabase
          .from('subscriptions')
          .update({
            status: 'trialing',
            plan_name: 'PRO',
            expires_at: newTrialEnds
          })
          .eq('id', currentSpecs.id);
      } else {
        await supabase
          .from('subscriptions')
          .insert({
            business_id: businessId,
            plan_name: 'PRO',
            status: 'trialing',
            started_at: new Date().toISOString(),
            expires_at: newTrialEnds,
            monthly_price: 19.90
          });
      }

      setSuccessMsg("Trial de 14 dias renovado e reiniciado para o parceiro!");
      await syncAdminDatasets();
    } catch (err: any) {
      setErrorMsg(`Erro ao resetar trial: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const executeCompleteCascadeAccountDeletion = async (ownerId: string, businessId: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      // We call the custom RPC function that definitively wipes out auth.users
      const { error: rpcErr } = await supabase.rpc('admin_delete_user', { target_user_id: ownerId });
      
      if (rpcErr) {
        // Fallback to local cascading if RPC doesn't exist
        console.warn("RPC admin_delete_user not found or failed, falling back to local dataset wipe", rpcErr);
        const queries = [
          { table: 'bookings', eq: 'business_id' },
          { table: 'services', eq: 'business_id' },
          { table: 'business_hours', eq: 'business_id' },
          { table: 'staff', eq: 'business_id' },
          { table: 'payments', eq: 'business_id' },
          { table: 'payouts', eq: 'business_id' },
          { table: 'subscriptions', eq: 'business_id' },
          { table: 'reviews', eq: 'business_id' },
          { table: 'loyalty_cards', eq: 'business_id' },
          { table: 'loyalty_history', eq: 'business_id' },
          { table: 'marketing_campaigns', eq: 'business_id' },
          { table: 'leads', eq: 'business_id' }
        ];

        for (const q of queries) {
          try {
            await supabase.from(q.table).delete().eq(q.eq, businessId);
          } catch (e) {
            console.warn(`Deleting from ${q.table} skipped:`, e);
          }
        }

        const { error: destBizErr } = await supabase
          .from('businesses')
          .delete()
          .eq('id', businessId);
        if (destBizErr && destBizErr.code !== '42P01') throw destBizErr;

        const { error: destProfErr } = await supabase
          .from('profiles')
          .delete()
          .eq('id', ownerId);
        if (destProfErr && destProfErr.code !== '42P01') throw destProfErr;
      }

      setSuccessMsg("Conta (Logins e Dados) eliminada e desativada definitivamente com sucesso!");
      setDeleteAccountModalOpen(false);
      setDeleteAccountTarget(null);
      setDeleteAccountDoubleConfirmText('');
      
      await syncAdminDatasets();
    } catch (err: any) {
      setErrorMsg(`Erro crítico na eliminação integral: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // Modify user role (Direct write to Supabase)
  const handleChangeRole = async (userId: string, targetRole: UserRole) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: targetRole })
        .eq('id', userId);

      if (error) throw error;
      setSuccessMsg(`Modificação concluída. Utilizador promovido a "${targetRole}".`);
      
      // Reactive state update
      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: targetRole } : p));
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao alterar perfil de privilégios.');
    }
  };

  // Toggle salon verified badge (Direct write to Supabase)
  const handleToggleSalonVerification = async (salonId: string, currentStatus: boolean) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ is_verified: !currentStatus })
        .eq('id', salonId);

      if (error) throw error;
      setSuccessMsg(`Selo de Verificação do Estabelecimento alterado com sucesso!`);
      
      // Reactive state update
      setSalons(prev => prev.map(s => s.id === salonId ? { ...s, is_verified: !currentStatus } : s));
    } catch (err: any) {
      setErrorMsg(err.message || 'Não foi possível alterar estado ativo da verificação.');
    }
  };

  // Delete User permanently (Direct table write)
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Deseja realmente eliminar permanentemente este utilizador do sistema? Esta operação apaga também a sua loja (caso exista) e cancela assinaturas Stripe. Esta operação é irreversível.")) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      // Usar a RPC de administrador para apagar tudo definitivamente (auth.users, profiles, businesses)
      const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId });

      if (error) throw error;
      
      const userSalon = salons.find(s => s.owner_id === userId);
      let successString = "Utilizador removido do sistema com sucesso!";
      
      if (userSalon && (userSalon.subscription_active || userSalon.subscription_status === 'active')) {
        successString += " Assinatura Stripe do salão cancelada automaticamente com sucesso.";
      }

      setSuccessMsg(successString);
      setProfiles(prev => prev.filter(p => p.id !== userId));
      setSalons(prev => prev.filter(s => s.owner_id !== userId));
    } catch (err: any) {
      console.error("Error deleting user profile", err);
      setErrorMsg("Erro ao eliminar utilizador: " + err.message);
    }
  };

  // Start editing user info
  const handleStartEditUser = (profile: UserProfile) => {
    setEditingUser(profile);
    setEditUserName(profile.full_name || '');
    setEditUserEmail(profile.email || '');
    setEditUserRole(profile.role || 'customer');
  };

  // Save changes to user profile
  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editUserName,
          email: editUserEmail,
          role: editUserRole
        })
        .eq('id', editingUser.id);

      if (error) throw error;
      setSuccessMsg("Perfil do utilizador actualizado com sucesso!");
      setEditingUser(null);
      // Update local state reactively
      setProfiles(prev => prev.map(p => p.id === editingUser.id ? { ...p, full_name: editUserName, email: editUserEmail, role: editUserRole } : p));
    } catch (err: any) {
      console.error("Error saving user modifications:", err);
      setErrorMsg("Falha ao actualizar utilizador: " + err.message);
    }
  };

  // Delete Salon and all its dependencies safely
  const handleDeleteSalon = async (salonId: string) => {
    if (!window.confirm("Aviso Master: Deseja mesmo eliminar de forma DEFINITIVA esta loja e todos os seus serviços, equipas, horários e marcações? Esta acção é irreversível e removerá todos os dados do ecossistema.")) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      // 1. Delete ratings/reviews
      await supabase.from('listings_rating').delete().eq('business_id', salonId);
      // 2. Delete staff
      await supabase.from('staff').delete().eq('business_id', salonId);
      // 3. Delete services
      await supabase.from('services').delete().eq('business_id', salonId);
      // 4. Delete business hours
      await supabase.from('business_hours').delete().eq('business_id', salonId);
      // 5. Delete payouts
      await supabase.from('payouts').delete().eq('business_id', salonId);
      // 6. Delete payments
      await supabase.from('payments').delete().eq('business_id', salonId);
      // 7. Delete bookings
      await supabase.from('bookings').delete().eq('business_id', salonId);

      // 8. Finally delete the shop record
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', salonId);

      if (error) throw error;
      setSuccessMsg("Lojista removido do sistema por completo!");
      setSalons(prev => prev.filter(s => s.id !== salonId));
      setSelectedSalon(null);
    } catch (err: any) {
      console.error("Error deleting salon:", err);
      setErrorMsg("Falha ao eliminar loja na íntegra: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Start editing salon info
  const handleStartEditSalon = (salon: Business) => {
    setEditingSalon(salon);
    setEditSalonName(salon.name);
    setEditSalonCategory(salon.category);
    setEditSalonPhone(salon.phone);
    setEditSalonCity(salon.city);
    setEditSalonDistrict(salon.district || 'Lisboa');
    setEditSalonAddress(salon.address);
    setEditSalonDescription(salon.description || '');
  };

  // Save changes to salon info
  const handleSaveEditSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSalon) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          name: editSalonName,
          category: editSalonCategory,
          phone: editSalonPhone,
          city: editSalonCity,
          district: editSalonDistrict,
          address: editSalonAddress,
          description: editSalonDescription
        })
        .eq('id', editingSalon.id);

      if (error) throw error;
      setSuccessMsg("Establecimento / Loja actualizada com sucesso!");
      setEditingSalon(null);
      // Update local state reactively
      setSalons(prev => prev.map(s => s.id === editingSalon.id ? {
        ...s,
        name: editSalonName,
        category: editSalonCategory,
        phone: editSalonPhone,
        city: editSalonCity,
        district: editSalonDistrict,
        address: editSalonAddress,
        description: editSalonDescription
      } : s));
    } catch (err: any) {
      console.error("Error editing salon profile:", err);
      setErrorMsg("Falha ao salvar modificações da loja: " + err.message);
    }
  };

  // Approve or complete payout request
      const handleDeleteDispute = async (disputeId: string) => {
    if (!window.confirm("Deseja mesmo apagar esta disputa da base de dados?")) return;
    try {
      const { error } = await supabase.from('disputes').delete().eq('id', disputeId);
      if (error) throw error;
      setSuccessMsg("Disputa apagada com sucesso.");
      setDisputes(prev => prev.filter(d => d.id !== disputeId));
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao apagar disputa.');
    }
  };

  const handleResolveDispute = async (disputeId: string, status: 'in_review' | 'resolved' | 'refunded' | 'dismissed') => {
    try {
      const notes = adminNotes[disputeId] || '';
      const updateData: any = { status };
      if (notes.trim()) updateData.admin_notes = notes.trim();
      
      const { error } = await supabase
        .from('disputes')
        .update(updateData)
        .eq('id', disputeId);
      if (error) throw error;
      setSuccessMsg(`Disputa atualizada para ${status}.`);
      setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status, admin_notes: updateData.admin_notes || d.admin_notes } : d));
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao atualizar disputa.');
    }
  };

  const handleUpdatePayoutStatus = async (payoutId: string, targetStatus: 'completed' | 'rejected') => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase
        .from('payouts')
        .update({ status: targetStatus })
        .eq('id', payoutId);

      // Sincronizar via local financeService
      financeService.updatePayoutStatus(payoutId, targetStatus === 'completed' ? 'pago' : 'falhado');

      setSuccessMsg(`Ordem de transferência bancária definida como "${targetStatus}" na contabilidade.`);
      await syncAdminDatasets();
      setPayoutRequests(financeService.getPayouts());
    } catch (err: any) {
      financeService.updatePayoutStatus(payoutId, targetStatus === 'completed' ? 'pago' : 'falhado');
      setSuccessMsg(`Ordem de transferência regulada no Sandbox Financeiro da Glamzo.`);
      setPayoutRequests(financeService.getPayouts());
    }
  };

  // Give loyalty credits/points (conceptual action)
  const handleAllocateCredits = (userId: string) => {
    setPointsAllocUserId(userId);
  };

  const submitCreditAllocation = () => {
    if (!pointsAllocUserId) return;
    setSuccessMsg(`Crédito de fomento atribuído com sucesso! Alocados +${pointsAllocVal} pontos promocionais à conta do utilizador.`);
    setPointsAllocUserId(null);
  };

  // Guard protecting admin panel workspace
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-rose-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-xs font-mono">Verificando privilégios administrativos unificados...</span>
      </div>
    );
  }

  if (!user || (profile && profile.role !== 'admin' && user.email !== 'admin@gmail.com' && user.email !== 'glamzo.suporte@gmail.com')) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl space-y-4">
          <ShieldAlert className="w-14 h-14 text-rose-500 mx-auto" />
          <h2 className="text-2xl font-black text-slate-900">Console Administrativo Exclusivo</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Área de administração global regulada por chave mestra de produção. Apenas credenciais homologadas podem aceder virtualmente ao Painel.
          </p>
          <a href="/admin/login" className="inline-block mt-4 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-slate-900 text-xs font-bold rounded-xl transition-all font-mono uppercase">
            Autenticar Administrador
          </a>
        </div>
      </div>
    );
  }

  // Filter datasets based on universal search term
  const filteredProfiles = profiles.filter(p => {
    const term = searchTerm.toLowerCase();
    return (p.email || '').toLowerCase().includes(term) || (p.full_name || '').toLowerCase().includes(term);
  });

  const filteredSalons = salons.filter(s => {
    const term = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(term) || s.city.toLowerCase().includes(term);
  });

  // Analytics aggregate metrics calculations
  const totalVolumeGrossCalculated = paymentsList.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalActiveSubscriptionsCount = profiles.filter(p => p.role === 'business').length;

  const getDynamicChartData = () => {
    if (!paymentsList || paymentsList.length === 0) {
      return [];
    }
    
    // Process real database payments list
    const sorted = [...paymentsList].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    // Group payments in weeks securely
    const w1 = sorted.filter(p => {
      const d = new Date(p.created_at).getDate();
      return d <= 7;
    }).reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const w2 = sorted.filter(p => {
      const d = new Date(p.created_at).getDate();
      return d > 7 && d <= 14;
    }).reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const w3 = sorted.filter(p => {
      const d = new Date(p.created_at).getDate();
      return d > 14 && d <= 21;
    }).reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const w4 = sorted.filter(p => {
      const d = new Date(p.created_at).getDate();
      return d > 21;
    }).reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return [
      { name: 'Dias 1-7', total: parseFloat(w1.toFixed(2)) },
      { name: 'Dias 8-14', total: parseFloat(w2.toFixed(2)) },
      { name: 'Dias 15-21', total: parseFloat(w3.toFixed(2)) },
      { name: 'Dias 22+', total: parseFloat(w4.toFixed(2)) }
    ];
  };

  return (
    <div id="admin-workspace" className="min-h-screen bg-slate-50 text-slate-800 flex font-sans select-none overflow-hidden h-screen">
      
      {/* Mobile Admin Sidebar Navigation Drawer Overlay */}
      {isMobileAdminSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
            onClick={() => setIsMobileAdminSidebarOpen(false)}
          />
          
          {/* Drawer content */}
          <div className="relative flex flex-col w-72 max-w-xs h-full bg-slate-50 border-r border-slate-200 p-5 shadow-2xl animate-fade-in text-slate-800 z-10 transition-transform">
            <div className="flex items-center justify-between pb-4 border-b border-purple-100 mb-4 shrink-0">
              <button onClick={handleLogout} title="Voltar ao site inicial (Terminar Sessão)" className="flex items-center gap-2.5 text-left hover:opacity-80 transition-opacity">
                <GlamzoLogo size={28} glow={true} />
                <div>
                  <span className="font-extrabold text-slate-900 text-xs tracking-widest block leading-none">GLAMZO LOGO</span>
                  <span className="text-[8px] font-mono uppercase font-bold text-purple-600 tracking-wider">Painel de Admin</span>
                </div>
              </button>
              <button 
                onClick={() => setIsMobileAdminSidebarOpen(false)}
                className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                title="Fechar Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-purple-950/20 border border-purple-900/35 rounded-xl mb-4 shrink-0">
              <span className="block text-[8px] font-mono text-purple-405 uppercase tracking-wider font-extrabold mb-1">Status de Conectividade</span>
              <span className="text-slate-900 block text-xs font-bold font-sans">Produção Supabase Real</span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-[9px] text-purple-600 font-mono text-nowrap">Canal Activo (Master)</span>
              </div>
            </div>

            {/* Scrolling Navigation Links */}
            <nav className="flex-1 space-y-1.5">
              {[
                { id: 'users', label: 'Utilizadores & Créditos', icon: Users },
                { id: 'partners', label: 'Gestão de Parceiros 👑', icon: ShieldAlert },
                { id: 'funnel', label: 'Funil & Abandonos ⚠️', icon: BadgeAlert },
                { id: 'club', label: 'Glamzo Club & Afiliados', icon: Sparkles },
                { id: 'sales_teams', label: 'Equipas de Vendas', icon: Briefcase },
                { id: 'payouts', label: 'Payouts & Planários', icon: Landmark },
                { id: 'support', label: 'Disputas & Tickets', icon: Scale },
                { id: 'terminal', label: 'Painel de Configurações', icon: Settings },
                { id: 'cms', label: 'Gestão da Homepage', icon: Globe },
                { id: 'pages', label: 'Páginas do Site', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setIsMobileAdminSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold tracking-tight rounded-xl transition-all cursor-pointer text-left ${
                      isActive 
                        ? 'bg-purple-600 text-slate-900 shadow shadow-purple-950/30' 
                        : 'text-slate-600 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex items-center gap-2">
                      {tab.label}
                      {tab.id === 'support' && disputes.some(d => d.status === 'open' || d.status === 'in_review') && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Bottom Profile */}
            <div className="pt-4 border-t border-purple-100 mt-4 shrink-0 col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center font-mono font-bold text-purple-700 text-xs border border-purple-500/20 shrink-0">
                  {profile?.full_name?.substring(0,2).toUpperCase() || 'A'}
                </div>
                <div className="overflow-hidden">
                  <span className="block text-xs font-bold truncate text-slate-900">{profile?.full_name || 'Admin Maestro'}</span>
                  <span className="block text-[9px] text-slate-500 font-mono truncate">{user?.email}</span>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900 rounded-lg transition-colors text-[11px] font-bold"
              >
                <LogOut className="w-3.5 h-3.5" />
                Terminar Sessão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Structural Admin Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-slate-200 bg-slate-50 flex-col justify-between shrink-0 h-full">
        <div>
          {/* Header Title branding */}
          <button onClick={handleLogout} title="Voltar ao site inicial (Terminar Sessão)" className="h-16 border-b border-slate-200 flex items-center px-6 gap-3 w-full text-left hover:bg-slate-100 transition-colors cursor-pointer">
            <GlamzoLogo size={32} glow={true} />
            <div>
              <span className="font-extrabold text-slate-900 tracking-widest block leading-none text-xs">GLAMZO LOGO</span>
              <span className="text-[9px] font-mono uppercase font-bold text-purple-600 tracking-wider">Painel de Administração</span>
            </div>
          </button>

          <div className="p-4 mx-4 my-2.5 bg-purple-950/20 border border-purple-900/35 rounded-xl text-xs">
            <span className="block text-[9px] font-mono text-purple-405 uppercase tracking-wider font-extrabold mb-1">Status de Conectividade</span>
            <span className="text-slate-900 block font-bold">Produção Supabase Real</span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-[10px] text-purple-600 font-mono text-nowrap">Canal de Controlo de Segurança</span>
            </div>
          </div>

          {/* Navigation Links inside admin sidebar */}
          <nav className="p-3.5 space-y-1.5">
            {[
              { id: 'users', label: 'Utilizadores & Créditos', icon: Users },
              { id: 'partners', label: 'Gestão de Parceiros 👑', icon: ShieldAlert },
              { id: 'funnel', label: 'Funil & Abandonos ⚠️', icon: BadgeAlert },
                { id: 'club', label: 'Glamzo Club & Afiliados', icon: Sparkles },
                { id: 'sales_teams', label: 'Equipas de Vendas', icon: Briefcase },
              { id: 'payouts', label: 'Payouts & Planários', icon: Landmark },
              { id: 'support', label: 'Disputas & Tickets', icon: Scale },
              { id: 'terminal', label: 'Glamzo Terminal', icon: Smartphone },
              { id: 'cms', label: 'Gestão da Homepage', icon: Globe },
              { id: 'pages', label: 'Páginas da Plataforma', icon: FileText },
              { id: 'analytics', label: 'Analytics Globais', icon: BarChart }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setSearchTerm(''); }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs rounded-xl font-bold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-purple-600 text-slate-900 shadow shadow-purple-950' 
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  <span className="flex items-center gap-2">
                    {tab.label}
                    {tab.id === 'support' && disputes.some(d => d.status === 'open' || d.status === 'in_review') && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin profile view bottom */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-purple-900 text-purple-200 flex items-center justify-center font-mono font-bold text-xs">
              AD
            </div>
            <div>
              <span className="block text-xs font-black text-slate-900">Administrador</span>
              <span className="block text-[10px] text-slate-500 font-mono truncate max-w-[150px]">{user?.email || 'admin@gmail.com'}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900 rounded-lg transition-colors text-[11px] font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            Terminar Sessão
          </button>
        </div>
      </aside>

      {/* Admin screen viewport */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between bg-slate-50/45 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar toggle button */}
            <button
              onClick={() => setIsMobileAdminSidebarOpen(true)}
              className="lg:hidden p-2 bg-[#120a21] border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-all cursor-pointer"
              title="Abrir Menu Administrativo"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-left">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>Painel Administrador Real</span>
                <span className="text-[9px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-600 font-bold border border-purple-900/40">MASTER_ACCESS</span>
              </h2>
            </div>
          </div>

          <button
            onClick={syncAdminDatasets}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold font-mono transition-all border border-slate-200 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sincronizar Produção</span>
          </button>
        </header>

        {/* View container with spacing to avoid overlaps */}
        <div className="flex-1 overflow-y-auto p-8 pb-36 scrollbar-thin scrollbar-thumb-slate-900">
          
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-900 text-emerald-600 rounded-2xl text-xs font-bold flex items-center gap-2 shadow animate-fade-in">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-950/40 border border-rose-900 text-rose-400 rounded-2xl text-xs font-bold animate-fade-in">
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-2.5">
              <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
              <span className="text-xs font-mono select-none">Consolidando ledger de faturamento e base cadastral unificada...</span>
            </div>
          ) : (
            <>
              {/* ==================================================== */}
              {/* SECTION: GESTÃO DE PARCEIROS (SHOPS & ACCOUNTS)     */}
              {/* ==================================================== */}
              {activeTab === 'partners' && (
                <div id="admin-partners" className="space-y-6">
                  {/* Title & Search Header */}
                  <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                        <span>Gestão Integrada de Parceiros</span>
                        <span className="text-xs bg-purple-950 text-purple-700 font-mono font-bold px-2.5 py-1 rounded-full border border-purple-500/20">👑 PRO Control</span>
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">Ative PRO manualmente, controle stripes, suspenda lojas ou apague contas de forma integral.</p>
                    </div>

                    <div className="relative w-full sm:max-w-xs">
                      <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Filtrar por nome de loja ou cidade..."
                        className="w-full bg-white border border-slate-200 text-xs pl-9 pr-4 py-2.5 rounded-xl text-slate-900 placeholder-slate-500 outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  {/* Partners Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {salons
                      .filter(sal => {
                        const term = searchTerm.toLowerCase();
                        return sal.name.toLowerCase().includes(term) || sal.city.toLowerCase().includes(term) || (sal.email || '').toLowerCase().includes(term);
                      })
                      .map(sal => {
                        const ownerProfile = profiles.find(p => p.id === sal.owner_id);
                        const trialDaysVal = (() => {
                          if (!sal.trial_ends_at) return 0;
                          const diff = new Date(sal.trial_ends_at).getTime() - Date.now();
                          return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
                        })();
                        const isSuspended = sal.subscription_status === 'suspended';
                        const isPro = sal.subscription_status === 'active' || sal.subscription_active;
                        const isTrial = sal.subscription_status === 'trialing';

                        return (
                          <div 
                            key={sal.id} 
                            className={`bg-white/60 border p-6 rounded-[24px] flex flex-col justify-between transition-all relative ${
                              isSuspended 
                                ? 'border-rose-950 bg-gradient-to-b from-[#1c080f]/40 to-[#0c0307]/60' 
                                : isPro
                                  ? 'border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.06)] bg-gradient-to-b from-[#110a24]/50 to-[#090514]/80'
                                  : 'border-purple-100 bg-white/40'
                            }`}
                          >
                            <div>
                              {/* Header Title with Subscriptions Badge tags */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-black text-slate-900 text-base leading-snug">{sal.name}</h4>
                                    {sal.is_verified && (
                                      <span className="w-2 h-2 rounded-full bg-purple-400" title="Verificado" />
                                    )}
                                  </div>
                                  <span className="text-[10px] font-mono text-purple-600 hover:underline block cursor-pointer">
                                    Slug: /{sal.slug}
                                  </span>
                                </div>

                                <div className="flex flex-col items-end gap-1 shrink-0">
                                  {isSuspended ? (
                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-rose-950 text-rose-600 border border-rose-900/55">
                                      Suspenso
                                    </span>
                                  ) : isPro ? (
                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-purple-950 text-purple-700 border border-purple-900/40">
                                      👑 Glamzo PRO
                                    </span>
                                  ) : isTrial ? (
                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-950 text-indigo-300 border border-indigo-900/40">
                                      Trial ({trialDaysVal} Dias Restantes)
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-200">
                                      Plano FREE
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Owner Account Details info panel */}
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-5 p-3.5 bg-slate-50/50 rounded-xl border border-purple-100 text-[11px] font-mono">
                                <div>
                                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-extrabold mb-1">Gestor / Email</span>
                                  <span className="text-slate-700 block truncate">{ownerProfile?.full_name || sal.name}</span>
                                  <span className="text-purple-700/80 block truncate">{ownerProfile?.email || sal.email || 'Não Consta'}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-slate-500 block text-[9px] uppercase tracking-wider font-extrabold mb-1">Inscrito em</span>
                                  <span className="text-slate-600 block">{new Date(sal.created_at).toLocaleDateString('pt-PT')}</span>
                                  <span className="text-slate-500 text-[10px] block">{new Date(sal.created_at).toLocaleTimeString('pt-PT', {hour:'2-digit', minute:'2-digit'})}</span>
                                </div>
                              </div>

                              {/* Stripe Connect stats */}
                              <div className="mt-4 p-3.5 bg-slate-50/40 rounded-xl border border-purple-100 space-y-1.5 text-[11px]">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-600 font-bold">Stripe Connect ID:</span>
                                  <span className="font-mono text-slate-600 select-all">{sal.stripe_account_id || 'Não configurado'}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-mono">
                                  <span className="text-slate-500">Cobranças Ativas (charges_enabled):</span>
                                  <span className={sal.charges_enabled ? "text-emerald-600 font-bold" : "text-slate-500"}>
                                    {sal.charges_enabled ? "SIM" : "NÃO"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-mono">
                                  <span className="text-slate-500">Pagamentos Ativos (payouts_enabled):</span>
                                  <span className={sal.payouts_enabled ? "text-emerald-600 font-bold" : "text-slate-500"}>
                                    {sal.payouts_enabled ? "SIM" : "NÃO"}
                                  </span>
                                </div>
                              </div>
                            </div>

                                                        {/* Action Buttons Hub */}
                            <div className="mt-6 border-t border-purple-100 pt-4 space-y-2.5">
                                {/* Row 1 */}
                                <div className="grid grid-cols-2 gap-2">
                                  <a 
                                    href={`/${sal.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="py-2.5 px-3 bg-slate-50 border border-slate-200 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg text-[10px] font-bold text-center uppercase tracking-wider inline-flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
                                    <span>Ver Dados</span>
                                  </a>

                                  <button
                                    type="button"
                                    onClick={() => handleToggleSalonVerification(sal.id, sal.is_verified)}
                                    className="py-2.5 px-3 bg-blue-950/50 hover:bg-blue-900/60 text-blue-300 hover:text-slate-900 border border-blue-900/40 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                                    <span>{sal.is_verified ? "Retirar Selo" : "Verificar Selo"}</span>
                                  </button>
                                </div>

                                {/* Row 2 */}
                                <div className="grid grid-cols-2 gap-2">
                                  {isPro ? (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveProManual(sal.id)}
                                      className="py-2.5 px-3 bg-slate-50 hover:bg-rose-950/20 text-slate-600 hover:text-rose-400 border border-slate-200 hover:border-rose-900/35 rounded-xl text-[10px] font-extrabold uppercase tracking-widest cursor-pointer transition-all animate-fade-in"
                                    >
                                      Remover PRO
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleActivateProManual(sal.id)}
                                      className="py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all shadow-md shadow-purple-950/30"
                                    >
                                      Ativar PRO
                                    </button>
                                  )}

                                  {isSuspended ? (
                                    <button
                                      type="button"
                                      onClick={() => handleReactivatePartner(sal.id)}
                                      className="py-2.5 px-3 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 hover:text-slate-900 border border-emerald-900/40 rounded-xl text-[10px] font-extrabold uppercase tracking-widest cursor-pointer transition-all"
                                    >
                                      Reativar Loja
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleSuspendPartner(sal.id)}
                                      className="py-2.5 px-3 bg-rose-950/55 hover:bg-rose-900/60 text-rose-300 hover:text-slate-900 border border-rose-900/40 rounded-xl text-[10px] font-extrabold uppercase tracking-widest cursor-pointer transition-all"
                                    >
                                      Suspender
                                    </button>
                                  )}
                                </div>

                                {/* Row 3 */}
                                <div className="pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeleteAccountTarget({
                                        ownerId: sal.owner_id,
                                        businessId: sal.id,
                                        name: sal.name
                                      });
                                      setDeleteAccountDoubleConfirmText('');
                                      setDeleteAccountModalOpen(true);
                                    }}
                                    className="w-full py-2.5 bg-rose-950/25 hover:bg-rose-600 text-rose-600 hover:text-slate-900 border border-rose-900/20 hover:border-transparent rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-1.5"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Eliminar Conta</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                        );
                      })}
                  </div>
                </div>
              )}
              {/* ==================================================== */}
              {/* SECTION 1: UTILIZADORES & CRÉDITOS                 */}
              {/* ==================================================== */}
              {activeTab === 'users' && (
                <div id="admin-users" className="space-y-6">
                  <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Utilizadores & Atribuição de Créditos</h3>
                      <p className="text-xs text-slate-600 mt-0.5">Mude perfis hierárquicos, configure administradores ou regule pontos de fidelidade.</p>
                    </div>

                    <div className="relative w-full sm:max-w-xs">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Pesquise por e-mail ou nome..."
                        className="w-full bg-white border border-slate-200 text-xs pl-9 pr-4 py-2 rounded-xl text-slate-900 placeholder-slate-650 outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  {/* Allocate credits custom sub-modal form */}
                  {pointsAllocUserId && (
                    <div className="p-5 bg-purple-950/20 border border-purple-900 rounded-3xl space-y-3 max-w-md animate-fade-in text-xs font-semibold">
                      <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        <Coins className="w-4.5 h-4.5 text-purple-600" />
                        <span>Atribuir Pontos Grátis de Fidelidade</span>
                      </h4>
                      <div className="flex items-center gap-3">
                        <input 
                          type="number" 
                          value={pointsAllocVal}
                          onChange={e => setPointsAllocVal(Number(e.target.value))}
                          className="w-28 bg-slate-50 border border-slate-200 p-2 rounded-xl text-slate-900 font-mono text-center outline-none focus:border-purple-600"
                        />
                        <button onClick={submitCreditAllocation} className="bg-purple-600 hover:bg-purple-700 text-slate-900 font-bold px-4 py-2 rounded-xl cursor-pointer">
                          Acrescentar Pontos à Conta
                        </button>
                        <button onClick={() => setPointsAllocUserId(null)} className="text-slate-600 hover:underline">Cancelar</button>
                      </div>
                    </div>
                  )}

                  {/* Accounts Table List */}
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-bold text-slate-450 uppercase tracking-widest border-b border-slate-105 border-slate-200">
                          <tr>
                            <th className="py-4.5 px-6">Cliente Cadastrado</th>
                            <th className="py-4.5 px-4">E-mail Registado</th>
                            <th className="py-4.5 px-4">Nível Administrativo (DB)</th>
                            <th className="py-4.5 px-4 text-center">Fidelidade</th>
                            <th className="py-4.5 px-6 text-right">Acções Gerais</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-105 divide-slate-900 text-xs">
                          {filteredProfiles.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/20 transition-colors">
                              <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-slate-100/80 border border-slate-705 border-slate-700 text-slate-600 font-bold flex items-center justify-center font-mono text-[10px]">
                                  {(p.full_name || p.email).substring(0,2).toUpperCase()}
                                </div>
                                <span className="truncate max-w-[150px]">{p.full_name || '-'}</span>
                              </td>

                              <td className="py-2.1 py-4 px-4 text-slate-600 font-mono select-all">
                                {p.email}
                              </td>

                              <td className="py-4 px-4">
                                <span className={`inline-block px-2 py-0.5 border rounded-full text-[9px] font-mono font-bold uppercase tracking-tight ${
                                  p.role === 'admin'
                                    ? 'bg-purple-950 border-purple-900 text-purple-600'
                                    : p.role === 'business'
                                    ? 'bg-amber-950 border-amber-900 text-amber-400'
                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                                }`}>
                                  {p.role}
                                </span>
                              </td>

                              <td className="py-4 px-4 text-center">
                                <button 
                                  onClick={() => handleAllocateCredits(p.id)}
                                  className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-purple-600 hover:text-purple-700 border border-slate-200 font-mono text-[10px] font-black cursor-pointer inline-flex items-center gap-1"
                                >
                                  <Coins className="w-3 h-3" />
                                  <span>Gerir Pontos</span>
                                </button>
                              </td>

                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-2.5">
                                  <select aria-label="Selecione uma opção"
                                    value={p.role}
                                    onChange={e => handleChangeRole(p.id, e.target.value as any)}
                                    className="bg-slate-50 border border-slate-200 p-1.5 rounded-lg text-xs hover:border-purple-650 outline-none text-slate-600 cursor-pointer"
                                  >
                                    <option value="customer">Acesso Customer (Cliente)</option>
                                    <option value="business">Acesso Business (Parceiro)</option>
                                    <option value="admin">Acesso Admin (Global MASTER)</option>
                                  </select>

                                  <button
                                    onClick={() => handleStartEditUser(p)}
                                    className="p-1.5 bg-[#100b21]/80 hover:bg-purple-950/40 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 hover:border-purple-500/20 transition-all cursor-pointer font-bold inline-flex items-center gap-1"
                                    title="Editar Informações"
                                  >
                                    <Settings className="w-3.5 h-3.5 text-purple-450" />
                                    <span className="text-[10px] uppercase font-mono hidden xl:inline">Editar</span>
                                  </button>

                                  <button
                                    onClick={() => handleDeleteUser(p.id)}
                                    className="p-1.5 bg-rose-50/80 hover:bg-rose-950/45 text-rose-600 hover:text-rose-300 rounded-lg border border-slate-200 hover:border-rose-950 transition-all cursor-pointer font-bold inline-flex items-center gap-1"
                                    title="Eliminar Utilizador"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                    <span className="text-[10px] uppercase font-mono hidden xl:inline">Eliminar</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION 3: PAYOUTS & PLANÁRIOS DE PREÇOS             */}
              {/* ==================================================== */}
              {activeTab === 'club' && <SuperAdminClub />}
              {activeTab === 'sales_teams' && <SalesAgentsTab />}
        
        {activeTab === 'payouts' && (
                <div id="admin-payouts" className="space-y-6 animate-fade-in">
                  <div className="border-b border-slate-200 pb-5">
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Transferências Stripe & Definição de Planos</h3>
                    <p className="text-xs text-slate-600 mt-0.5">Processe ordens de levantamento dos parceiros comerciais e configure os limites de taxas.</p>
                  </div>

                  {/* Partition payouts list and parameters definition */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Requested payouts list column */}
                    <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                      <h4 className="font-extrabold text-xs text-slate-600 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                        <Landmark className="w-5 h-5 text-purple-600" />
                        <span>Pedidos de Transferência Recebidos (BD)</span>
                      </h4>

                      <div className="space-y-3.5 max-h-[400px] overflow-y-auto scrollbar-thin">
                        {payoutRequests.map((po, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
                            <div>
                              <span className="block font-black text-sm text-slate-900 font-mono">{po.amount.toFixed(2)} €</span>
                              <span className="text-[10px] text-purple-600 font-bold tracking-tight mt-0.5 block truncate max-w-[150px]">Lojista: {po.business?.name || 'Pendente'}</span>
                              <span className="text-[9px] text-slate-550 text-slate-500 font-mono mt-0.5 block">IBAN Registado no Stripe Connect</span>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              {po.status === 'pending' ? (
                                <>
                                  <button 
                                    onClick={() => handleUpdatePayoutStatus(po.id, 'completed')}
                                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-slate-900 font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                                  >
                                    Autorizar
                                  </button>
                                  <button 
                                    onClick={() => handleUpdatePayoutStatus(po.id, 'rejected')}
                                    className="px-2 py-1 bg-rose-950/20 text-rose-600 hover:bg-rose-955 rounded-lg text-[10px] cursor-pointer"
                                  >
                                    Recusar
                                  </button>
                                </>
                              ) : (
                                <span className={`inline-block px-2.5 py-0.5 border rounded-full text-[9px] font-mono font-bold uppercase ${
                                  po.status === 'completed' ? 'bg-purple-950 border-purple-900 text-purple-600' : 'bg-slate-50 text-slate-500 border-slate-200'
                                }`}>
                                  {po.status === 'completed' ? 'Efetuado' : 'Cancelado'}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}

                        {payoutRequests.length === 0 && (
                          <p className="text-xs text-slate-500 font-mono text-center py-10">Sem ordens de transferência pendentes.</p>
                        )}
                      </div>
                    </div>

                    {/* Subscription planes custom configurations */}
                    <div className="lg:col-span-5 space-y-6">
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                        <h4 className="font-extrabold text-xs text-slate-600 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                          <Tag className="w-4.5 h-4.5 text-purple-600" />
                          <span>Homologação e Parâmetros</span>
                        </h4>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5 text-xs text-slate-350">
                          <div>
                            <span className="block text-[9px] font-mono text-slate-500 uppercase font-black mb-1.5">Período Experimental de Lojas (Dias)</span>
                            <input type="number" defaultValue={45} className="w-full bg-white border border-slate-200 p-2 rounded-xl text-slate-900 outline-none focus:border-purple-600 font-mono text-xs" />
                          </div>

                          <div>
                            <span className="block text-[9px] font-mono text-slate-500 uppercase font-black mb-1.5">Mensalidade Padrão Plano PRO (€)</span>
                            <input type="number" defaultValue={19.90} className="w-full bg-white border border-slate-200 p-2 rounded-xl text-slate-900 outline-none focus:border-purple-600 font-mono text-xs" />
                          </div>

                          <div>
                            <span className="block text-[9px] font-mono text-slate-500 uppercase font-black mb-1.5">Taxa de Comissão Marketplace (%)</span>
                            <input type="number" defaultValue={5} className="w-full bg-white border border-slate-200 p-2 rounded-xl text-slate-900 outline-none focus:border-purple-600 font-mono text-xs" />
                          </div>

                          <button onClick={() => setSuccessMsg("Plano de Preçários, Comissões e Períodos experimentais de novas lojas modificado com sucesso!")} className="w-full py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold rounded-xl hover:text-purple-600 transition-all uppercase tracking-wide text-[10px] cursor-pointer">
                            Actualizar Parâmetros Comerciais
                          </button>
                        </div>
                      </div>

                      {/* Coupon Creator Interactive Console */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                        <h4 className="font-extrabold text-xs text-slate-600 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                          <Plus className="w-4.5 h-4.5 text-purple-600 animate-pulse" />
                          <span>Gerador de Cupões Comerciais</span>
                        </h4>

                        <form onSubmit={handleCreateCoupon} className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                          <div>
                            <label className="block text-[9px] font-mono text-slate-500 uppercase font-black mb-1">Código do Cupão</label>
                            <input
                              type="text"
                              required
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 text-xs font-mono select-all focus:border-purple-500 outline-none"
                              placeholder="GLAMZOPRO45"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] font-mono text-slate-500 uppercase font-black mb-1">Trial (Dias)</label>
                              <input
                                type="number"
                                required
                                value={couponDuration}
                                onChange={(e) => setCouponDuration(Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 text-xs font-mono outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-mono text-slate-500 uppercase font-black mb-1">Uso Limite</label>
                              <input
                                type="number"
                                required
                                value={couponLimit}
                                onChange={(e) => setCouponLimit(Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-900 text-xs font-mono outline-none"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-800 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-wider transition hover:from-purple-500 hover:to-purple-700 cursor-pointer"
                          >
                            Criar Cupão Admin
                          </button>
                        </form>

                        {/* List of active created promos */}
                        <div className="space-y-2 mt-4">
                          <span className="block text-[9px] font-mono text-slate-500 uppercase font-black pl-1">Cupões Ativos no Sistema</span>
                          <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
                            {couponsList.map((cp) => (
                              <div key={cp.code} className="p-2.5 bg-slate-50 rounded-xl border border-slate-910 flex items-center justify-between text-[11px] font-mono text-slate-600">
                                <div className="text-left">
                                  <span className="text-slate-900 font-black">{cp.code}</span>
                                  <span className="block text-[9px] text-slate-500">{cp.trial_days} dias experimental • Max: {cp.max_uses}</span>
                                </div>
                                <span className="bg-purple-950 text-purple-600 border border-purple-900 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                  {cp.uses} / {cp.max_uses}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION 4: DISPUTAS & TICKETS DE SUPORTE             */}
              {/* ==================================================== */}
              {activeTab === 'support' && (
                <div id="admin-support" className="space-y-6 animate-fade-in w-full">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Centro de Resolução e Apoio</h3>
                      <p className="text-xs text-slate-600 mt-0.5">Comunique-se com clientes ou parceiros. Avalie disputas e conflitos.</p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => setSupportSubTab('messages')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${supportSubTab === 'messages' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        Mensagens
                      </button>
                      <button
                        onClick={() => setSupportSubTab('disputes')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${supportSubTab === 'disputes' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        Disputas
                        {disputes.filter(d => d.status === 'open' || d.status === 'in_review').length > 0 && (
                          <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{disputes.filter(d => d.status === 'open' || d.status === 'in_review').length}</span>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {supportSubTab === 'messages' && <UniversalInbox myId="admin" myType="admin" />}
                  {supportSubTab === 'disputes' && <UniversalDisputes myId="admin" myType="admin" />}
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION 5: GLAMZO TERMINAL LOGISTICS                 */}
              {/* ==================================================== */}
              {activeTab === 'terminal' && (
                <div id="admin-terminal" className="space-y-6 animate-fade-in max-w-2xl">
                  <div className="border-b border-slate-200 pb-5">
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Logística de CTT Glamzo Terminal</h3>
                    <p className="text-xs text-slate-600 mt-0.5">Gerenciar pedidos de tablets táteis das lojas, enviar com código de rastreio e conferir cauções.</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
                      <h4 className="font-extrabold text-xs uppercase tracking-widest flex items-center gap-1.5">
                        <Smartphone className="w-5 h-5 text-purple-600 animate-pulse" />
                        <span>Encomendas e Despachos de Tablets Comodato</span>
                      </h4>

                      {/* Filters */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTerminalFilter('all')}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${terminalFilter === 'all' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                        >
                          Todos os Pedidos
                        </button>
                        <button
                          onClick={() => setTerminalFilter('awaiting_shipment')}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 ${terminalFilter === 'awaiting_shipment' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          Aguardando Envio
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      {terminalRequests
                        .filter(tr => {
                          if (terminalFilter === 'awaiting_shipment') {
                            return tr.deposit_paid === true && tr.status !== 'shipped' && tr.status !== 'delivered';
                          }
                          return true;
                        })
                        .map((tr, idx) => (
                          <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-3 text-xs">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-black text-slate-900 text-sm">{tr.salon}</span>
                                <div className="text-slate-600 mt-1 space-y-0.5">
                                  <p><span className="font-semibold text-slate-800">Destinatário:</span> {tr.shipping_name || 'Desconhecido'}</p>
                                  <p><span className="font-semibold text-slate-800">Telefone:</span> {tr.shipping_phone || '---'}</p>
                                  <p><span className="font-semibold text-slate-800">Morada:</span> {tr.shipping_address || '---'}</p>
                                  <p><span className="font-semibold text-slate-800">CP / Cidade:</span> {tr.shipping_postal_code} - {tr.city}</p>
                                  <p className="mt-1">
                                    <span className="font-semibold text-slate-800">Caução Fixa (9,99€):</span>{' '}
                                    {tr.deposit_paid ? <span className="text-emerald-600 font-bold">Paga via Stripe</span> : <span className="text-amber-600 font-bold">Pendente Pagamento</span>}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[9px] font-mono uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">{tr.status}</span>
                            </div>

                            <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
                               <div className="flex items-center gap-2">
                                 <input 
                                    type="text" 
                                    placeholder="Transportadora (e.g., CTT)"
                                    defaultValue={tr.carrier || ''}
                                    id={`carrier-${tr.id}`}
                                    className="w-1/3 px-2 py-1.5 text-xs border border-slate-300 rounded focus:border-purple-500 bg-white"
                                 />
                                 <input 
                                    type="text" 
                                    placeholder="Tracking Code"
                                    defaultValue={tr.tracking_code || ''}
                                    id={`tracking-${tr.id}`}
                                    className="flex-1 px-2 py-1.5 text-xs border border-slate-300 rounded focus:border-purple-500 bg-white"
                                 />
                               </div>
                               <div className="flex items-center gap-2">
                                 <button 
                                   onClick={() => handleConfirmShipment(tr.id)}
                                   className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded uppercase flex-1 transition-all"
                                 >
                                   Confirmar Envio
                                 </button>
                                 <button 
                                   onClick={() => handleMarkDelivered(tr.id)}
                                   className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded uppercase flex-1 transition-all"
                                 >
                                   Marcar Entregue
                                 </button>
                               </div>
                            </div>
                          </div>
                        ))}
                      {terminalRequests.filter(tr => {
                        if (terminalFilter === 'awaiting_shipment') {
                          return tr.deposit_paid === true && tr.status !== 'shipped' && tr.status !== 'delivered';
                        }
                        return true;
                      }).length === 0 && <div className="text-center py-4 text-xs font-mono text-slate-500">Nenhum pedido correspondente ao filtro.</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION 6: PLATFORM ANALYTICS DASHBOARD              */}
              {/* ==================================================== */}
              {activeTab === 'analytics' && (
                <div id="admin-analytics" className="space-y-6 animate-fade-in">
                  <div className="border-b border-slate-200 pb-5">
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Volume de Negócios Central (Stripe Integrado)</h3>
                    <p className="text-xs text-slate-600 mt-0.5">Métricas globais operacionais e contabilidade corporativa real sob as chaves Supabase.</p>
                  </div>

                  {/* Summary aggregate cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white border border-slate-200 rounded-3xl p-5 flex items-center gap-4 border-r-4 border-r-purple-650 border-r-purple-600">
                      <div className="w-12 h-12 bg-purple-950 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-900">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono text-slate-500 uppercase font-black leading-none">Profissionais PRO</span>
                        <span className="text-xl font-black text-slate-900 mt-1 block">{totalActiveSubscriptionsCount}</span>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-5 flex items-center gap-4 border-r-4 border-r-purple-650 border-r-purple-600">
                      <div className="w-12 h-12 bg-purple-950 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-900">
                        <Coins className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono text-slate-500 uppercase font-black leading-none">Volume Transacionado</span>
                        <span className="text-xl font-black text-slate-900 mt-1 block">{totalVolumeGrossCalculated.toFixed(2)} €</span>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-5 flex items-center gap-4 border-r-4 border-r-purple-650 border-r-purple-600">
                      <div className="w-12 h-12 bg-purple-950 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-900">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="block text-[9px] font-mono text-slate-500 uppercase font-black leading-none">Comissões Plataforma</span>
                        <span className="text-xl font-black text-slate-900 mt-1 block">{(totalVolumeGrossCalculated * 0.05).toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart aggregators */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Platform users breakdown pie chart */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3">
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Distribuição de Contas de Acesso</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RBarChart data={[
                            { role: 'Clientes', count: profiles.filter(p => p.role === 'customer').length },
                            { role: 'Lojistas', count: profiles.filter(p => p.role === 'business').length },
                            { role: 'Admins', count: profiles.filter(p => p.role === 'admin').length }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="role" stroke="#64748b" fontSize={11} />
                            <YAxis stroke="#64748b" fontSize={11} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} labelStyle={{ color: '#fff' }} />
                            <Bar dataKey="count" fill="#9333ea" name="Registos Totais" radius={[4, 4, 0, 0]} />
                          </RBarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Aggregate Platform Billing line diagram */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 flex flex-col justify-between">
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Gráfico Volumétrico Transacional Mensal</h4>
                      <div className="h-64 flex items-center justify-center">
                        {getDynamicChartData().length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <RLineChart data={getDynamicChartData()}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                              <YAxis stroke="#64748b" fontSize={11} unit="€" />
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} labelStyle={{ color: '#fff' }} />
                              <Line type="monotone" dataKey="total" stroke="#9333ea" name="Volume" strokeWidth={2.5} />
                            </RLineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-center p-6 border border-dashed border-slate-200 rounded-2xl w-full h-full flex flex-col items-center justify-center bg-slate-50/20">
                            <BarChart className="w-8 h-8 text-slate-500 mb-2" />
                            <p className="text-slate-900 font-bold text-xs">Sem dados disponíveis</p>
                            <p className="text-[10px] text-slate-500 mt-1">Os dados serão apresentados após atividade real.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION 7: HOMEPAGE CARDS CMS                      */}
              {/* ==================================================== */}
              {activeTab === 'cms' && (
                <div id="admin-cms" className="space-y-6 animate-fade-in font-sans">
                  <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight text-slate-900 mb-1">CMS de Gestão da Homepage</h3>
                      <p className="text-xs text-slate-600 mt-0.5">Gerencie os cartões de destaques da página inicial diretamente da base de dados e com uploads otimizados.</p>
                    </div>
                    <button
                      onClick={fetchHomepageCards}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-850 border border-slate-850 rounded-xl text-slate-600 text-xs font-semibold font-mono cursor-pointer transition-all self-start"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sincronizar Cards</span>
                    </button>
                  </div>

                  {/* Proactive Storage and avatars creation SQL query notice */}
                  <div className="p-5 bg-[#0a0515]/30 border border-slate-850 rounded-3xl space-y-3">
                    <div className="flex items-center gap-2 text-purple-600 font-extrabold text-xs uppercase tracking-wider font-mono">
                      <span>🗄️ Query SQL para criar o Bucket "avatars" no Supabase Storage:</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Se você presenciar falhas de upload ou erros de "bucket não encontrado" ao definir fotos de equipe, imagens do CMS, ou avatares de perfis, copie o script abaixo e execute-o no seu painel <strong>SQL Editor</strong> do Supabase. Ele cria o bucket <code>avatars</code> e define as regras RLS corretas:
                    </p>
                    <pre className="bg-slate-50 text-emerald-600 p-4 rounded-xl overflow-x-auto text-[10px] font-mono select-all select-text leading-relaxed scrollbar-thin">
{`-- 1. Criar o bucket publico "avatars" se nao existir
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880, -- Limite de 5MB
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
on conflict (id) do nothing;

-- 2. Ativar RLS em storage.objects se nao estiver ativa
alter table storage.objects enable row level security;

-- 3. Limpar politicas anteriores para evitar colisao
drop policy if exists "Permitir leitura publica de avatars" on storage.objects;
drop policy if exists "Permitir uploads para avatars" on storage.objects;
drop policy if exists "Permitir updates em avatars" on storage.objects;
drop policy if exists "Permitir delete em avatars" on storage.objects;

-- 4. Criar politicas para leitura publica e operacoes de upload autenticado
create policy "Permitir leitura publica de avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Permitir uploads para avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Permitir updates em avatars"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Permitir delete em avatars"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');`}
                    </pre>
                  </div>

                  {cmsError && (
                    <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-2xl text-purple-200 text-xs space-y-3 leading-relaxed">
                      <div className="flex items-center gap-2 text-purple-600 font-bold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>AVISO / INFORMAÇÃO OPERACIONAL</span>
                      </div>
                      <p>{cmsError}</p>
                      
                      {cmsError.includes("tabela 'homepage_cards'") && (
                        <div className="space-y-2 mt-4">
                          <span className="block text-[10px] text-slate-600 uppercase font-mono font-black">Query SQL para criar a tabela no Supabase editor:</span>
                          <pre className="bg-slate-50 text-emerald-600 p-4 rounded-xl overflow-x-auto text-[10px] font-mono select-all select-text leading-relaxed">
{`-- Criar tabela homepage_cards para o CMS da Homepage da Glamzo
create table if not exists public.homepage_cards (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  subtitle text not null,
  image_url text not null,
  display_order integer default 1 not null,
  active boolean default true not null,
  emoji text default '✨',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ativar RLS
alter table public.homepage_cards enable row level security;

-- Criar política de leitura pública para todas as pessoas
create policy "Allow public read access on homepage_cards" 
  on public.homepage_cards for select 
  using (true);

-- Criar política de escrita completa para utilizadores autenticados autoritários (admins)
create policy "Allow admins full operations on homepage_cards" 
  on public.homepage_cards for all 
  using (true) 
  with check (true);`}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* FORM SECTION (5 cols) */}
                    <form onSubmit={handleSaveCmsCard} className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider border-b border-slate-850 pb-3 mb-1 font-mono">
                        {editingCardId ? "📝 Editar Cartão de Destaque" : "✨ Novo Cartão de Destaque"}
                      </h4>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 pl-1">Categoria Alvo / Título do Cartão</label>
                        <select aria-label="Selecione uma opção"
                          required
                          value={cmsTitle}
                          onChange={(e) => {
                            setCmsTitle(e.target.value);
                            const matched = MAIN_CATEGORIES.find(m => m.name === e.target.value);
                            if (matched && (!cmsEmoji || cmsEmoji === '✨' || cmsEmoji === '')) {
                              setCmsEmoji(matched.emoji);
                            }
                          }}
                          className="w-full bg-[#0a0515] text-slate-700 border border-slate-200 px-3 py-3 rounded-xl text-xs focus:outline-none focus:border-purple-500 font-medium cursor-pointer"
                        >
                          <option value="" className="text-slate-650">-- Selecione uma Categoria Alvo --</option>
                          {MAIN_CATEGORIES.map((cat) => (
                            <option key={cat.name} value={cat.name} className="bg-white text-slate-150">
                              {cat.emoji} {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div className="sm:col-span-8">
                          <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 pl-1">Emoji / Ícone</label>
                          <input
                            type="text"
                            value={cmsEmoji}
                            onChange={(e) => setCmsEmoji(e.target.value)}
                            placeholder="Ex: 💇, 💅, ✨"
                            className="w-full bg-[#0a0515] border border-slate-200 px-3 py-2.5 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-medium"
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 pl-1">Ordem</label>
                          <input
                            type="number"
                            value={cmsDisplayOrder}
                            onChange={(e) => setCmsDisplayOrder(Number(e.target.value))}
                            className="w-full bg-[#0a0515] border border-slate-200 px-3 py-2.5 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 pl-1">Subtítulo / Descrição Breve</label>
                        <textarea
                          required
                          rows={2}
                          value={cmsSubtitle}
                          onChange={(e) => setCmsSubtitle(e.target.value)}
                          placeholder="Mais de 30 salões recomendados com agendamento instantâneo."
                          className="w-full bg-[#0a0515] border border-slate-200 px-3 py-2.5 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-medium placeholder-slate-600 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">Imagem do Cartão (Otimizado/Conversão recomendada)</label>
                        
                        {/* File selector input */}
                        <div className="mt-1.5 mb-2.5">
                          <input
                            type="file"
                            accept="image/*"
                            id="cms-upload-input"
                            onChange={handleCmsImageUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="cms-upload-input"
                            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-950/40 hover:bg-purple-900/40 border border-purple-900/60 rounded-xl cursor-pointer text-purple-700 text-xs font-bold transition-all text-center"
                          >
                            {isUploadingCmsImage ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>A carregar no Storage...</span>
                              </>
                            ) : (
                              <>
                                <span>📤 Enviar Nova Imagem</span>
                              </>
                            )}
                          </label>
                        </div>

                        {/* Text input URL option */}
                        <div className="relative">
                          <input
                            type="text"
                            value={cmsImageUrl}
                            onChange={(e) => setCmsImageUrl(e.target.value)}
                            placeholder="Copiar URL gerada ou colar URL de imagem..."
                            className="w-full bg-[#0a0515] border border-slate-200 px-3 py-2 rounded-xl text-[11px] text-slate-900 focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>

                      {/* Preview Image Block */}
                      {cmsImageUrl && (
                        <div className="h-28 rounded-2xl overflow-hidden border border-slate-200 relative bg-slate-50">
                          <img loading="lazy"
                            src={cmsImageUrl}
                            alt="CMS Preview"
                            className="w-full h-full object-cover opacity-80"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[9px] text-purple-700 font-bold uppercase font-mono">
                            Preview
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2.5 pt-1.5 pl-1">
                        <input
                          type="checkbox"
                          id="cms-active-checkbox"
                          checked={cmsActive}
                          onChange={(e) => setCmsActive(e.target.checked)}
                          className="rounded bg-slate-50 border-slate-805 border-slate-200 text-purple-600 focus:ring-purple-500 w-4.5 h-4.5 cursor-pointer"
                        />
                        <label htmlFor="cms-active-checkbox" className="text-xs text-slate-600 font-bold cursor-pointer select-none">
                          Card Ativo na Homepage
                        </label>
                      </div>

                      <div className="pt-3 flex gap-3">
                        <button
                          type="submit"
                          className="flex-1 bg-purple-600 hover:bg-purple-500 text-slate-900 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer shadow hover:scale-[1.01]"
                        >
                          {editingCardId ? "Gravar Edição" : "Adicionar Card"}
                        </button>
                        {editingCardId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCardId(null);
                              setCmsTitle('');
                              setCmsSubtitle('');
                              setCmsImageUrl('');
                              setCmsDisplayOrder(homepageCards.length + 1);
                              setCmsActive(true);
                              setCmsEmoji('✨');
                            }}
                            className="px-3 py-2.5 bg-slate-100 hover:bg-slate-750 text-slate-350 rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </form>

                    {/* CARDS LIST SECTION (7 cols) */}
                    <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                        <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider font-mono">
                          🗄️ Cartões Ativos da Homepage ({homepageCards.length})
                        </h4>
                        <span className="text-[9px] font-mono uppercase bg-purple-950/40 text-purple-600 border border-purple-900/60 px-2 py-0.5 rounded-full font-bold">
                          Total {homepageCards.length}
                        </span>
                      </div>

                      {loadingCards ? (
                        <div className="h-44 flex flex-col items-center justify-center text-slate-600 gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-purple-500" />
                          <span className="text-[10px] font-mono">A interrogar a tabela homepage_cards...</span>
                        </div>
                      ) : homepageCards.length === 0 ? (
                        <div className="p-8 text-center bg-[#0a0515]/30 rounded-2xl border border-dashed border-slate-200">
                          <HelpCircle className="w-8 h-8 text-slate-705 text-slate-700 mx-auto mb-2" />
                          <p className="text-slate-600 font-medium">Nenhum cartão dinâmico encontrado na base de dados.</p>
                          <p className="text-slate-600 text-[11px] mt-1">A página inicial exibirá as categorias estáticas como fallback seguro de performance.</p>
                        </div>
                      ) : (
                        <div className="space-y-3.5">
                          {homepageCards.map((card, idx) => (
                            <div key={card.id || idx} className="p-3 bg-[#0a0515]/60 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-16 h-12 rounded-xl overflow-hidden relative shrink-0 bg-slate-50 border border-slate-200">
                                  <img loading="lazy"
                                    src={card.image_url}
                                    alt={card.title}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className="absolute bottom-1 right-1 text-xs bg-black/60 px-1 rounded text-slate-900 leading-none">
                                    {card.emoji || '✨'}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-slate-900 text-xs truncate uppercase tracking-tight">{card.title}</span>
                                    {!card.active && (
                                      <span className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-[8px] text-slate-500 uppercase font-mono font-bold">
                                        Inativo
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1 leading-normal">{card.subtitle}</p>
                                  <div className="flex items-center gap-3 text-[9px] font-mono text-slate-500 mt-1 align-middle">
                                    <span className="text-purple-600 font-bold">Ordem: {card.display_order}</span>
                                    <span>•</span>
                                    <span className="text-slate-500">Última edição: {new Date(card.updated_at || card.created_at).toLocaleDateString('pt-PT')}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 select-none">
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() => handleMoveOrder(card, 'up')}
                                    disabled={idx === 0}
                                    type="button"
                                    title="Subir Ordem"
                                    className="p-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 disabled:opacity-20 cursor-pointer text-[10px]"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    onClick={() => handleMoveOrder(card, 'down')}
                                    disabled={idx === homepageCards.length - 1}
                                    type="button"
                                    title="Descer Ordem"
                                    className="p-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 disabled:opacity-20 cursor-pointer text-[10px]"
                                  >
                                    ▼
                                  </button>
                                </div>

                                <div className="flex gap-1.5 ml-2.5">
                                  <button
                                    onClick={() => handleEditCmsCard(card)}
                                    type="button"
                                    className="px-2.5 py-1 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-900/40 text-purple-700 text-[10px] font-bold cursor-pointer transition-all"
                                    title="Editar Cartão"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCmsCard(card.id)}
                                    type="button"
                                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-850 border border-slate-200 text-red-400 hover:text-red-300 text-xs font-bold cursor-pointer transition-all"
                                    title="Eliminar Cartão"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION 8: PLATFORM PAGES CMS                      */}
              {/* ==================================================== */}
              {activeTab === 'pages' && (
                <div id="admin-pages" className="space-y-6 animate-fade-in font-sans">
                  <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight text-slate-900 mb-1">Páginas da Plataforma</h3>
                      <p className="text-xs text-slate-600 mt-0.5">Edite os termos legais, políticas de privacidade e informações de apoio.</p>
                    </div>
                    <button
                      onClick={fetchPlatformPages}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-850 border border-slate-850 rounded-xl text-slate-600 text-xs font-semibold font-mono cursor-pointer transition-all self-start"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sincronizar</span>
                    </button>
                  </div>

                  {pagesError && (
                    <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-2xl text-purple-200 text-xs space-y-3 leading-relaxed">
                      <div className="flex items-center gap-2 text-purple-600 font-bold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>AVISO / INFORMAÇÃO OPERACIONAL</span>
                      </div>
                      <p>{pagesError}</p>
                      
                      {pagesError.includes("platform_pages") && (
                        <div className="space-y-2 mt-4">
                          <span className="block text-[10px] text-slate-600 uppercase font-mono font-black">Query SQL para criar a funcionalidade CMS e RPC Apagar Contas:</span>
                          <pre className="bg-slate-50 text-emerald-600 p-4 rounded-xl overflow-x-auto text-[10px] font-mono select-all select-text leading-relaxed">
{`-- 1. CMS de Plataforma
create table if not exists public.platform_pages (
  slug text primary key,
  title text not null,
  content text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.platform_pages enable row level security;

create policy "Allow public read access on platform_pages" 
  on public.platform_pages for select using (true);

create policy "Allow admins full operations on platform_pages" 
  on public.platform_pages for all 
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')) 
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- 2. Sistema Definitivo de Remoção de Uso (auth.users via backend admin)
create or replace function public.admin_delete_user(target_user_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Unauthorised';
  end if;

  delete from public.businesses where owner_id = target_user_id;
  delete from public.profiles where id = target_user_id;
  delete from auth.users where id = target_user_id;
end;
$$;`}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* PAGES LISTING */}
                    <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 space-y-4">
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider font-mono border-b border-slate-850 pb-3">Páginas de Sistema</h4>
                      
                      <div className="flex flex-col gap-2">
                        {[
                          { id: 'termos-e-condicoes', name: 'Termos e Condições' },
                          { id: 'politica-de-privacidade', name: 'Política de Privacidade' },
                          { id: 'politica-de-cookies', name: 'Política de Cookies' },
                          { id: 'politica-de-cancelamentos', name: 'Can. e Reembolsos' },
                          { id: 'politica-de-pagamentos', name: 'Política de Pagamentos' },
                          { id: 'seguranca-e-protecao-de-dados', name: 'Segurança / Dados' },
                          { id: 'faq-cliente', name: 'FAQ do Cliente' },
                          { id: 'faq-parceiro', name: 'FAQ do Parceiro' },
                          { id: 'sobre-nos', name: 'Sobre a Glamzo' }
                        ].map(page => {
                          const existingData = platformPages.find(p => p.slug === page.id);
                          return (
                            <button
                              key={page.id}
                              onClick={() => {
                                setEditingPageSlug(page.id);
                                setPageDraftTitle(existingData?.title || page.name);
                                setPageDraftContent(existingData?.content || PAGE_FALLBACKS[page.id] || '');
                              }}
                              className={`text-left px-4 py-3 rounded-xl text-xs font-semibold transition-all ${editingPageSlug === page.id ? 'bg-purple-900/40 text-purple-200 border border-purple-800' : 'bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent'}`}
                            >
                              <div className="flex justify-between items-center">
                                <span>{page.name}</span>
                                {existingData && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* EDITOR */}
                    {editingPageSlug ? (
                      <div className="lg:col-span-8 bg-[#0a0515]/30 border border-slate-850 rounded-3xl p-5 sm:p-6 shadow-2xl">
                        <form onSubmit={handleSavePage} className="space-y-5">
                          <div className="flex justify-between items-end">
                            <h4 className="font-extrabold text-xs text-purple-600 uppercase tracking-wider font-mono">Editor de Markup da Página</h4>
                            <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500 font-mono">/{editingPageSlug}</span>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Título da Página (H1)</label>
                            <input
                              type="text"
                              value={pageDraftTitle}
                              onChange={e => setPageDraftTitle(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors placeholder:text-slate-700"
                              required
                            />
                          </div>

                          <div>
                            <div className="flex justify-between items-end mb-1.5">
                              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Conteúdo (Suporta HTML Básico)</label>
                            </div>
                            <textarea
                              value={pageDraftContent}
                              onChange={e => setPageDraftContent(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-colors placeholder:text-slate-700 font-mono h-[400px] resize-y leading-relaxed"
                              required
                              placeholder="<p>Escreva aqui o seu texto legal ou de ajuda...</p>\n<h2>Títulos 2</h2>"
                            />
                            <p className="text-[10px] text-slate-600 mt-2">Dica: Use &lt;h2&gt; ou &lt;h3&gt; para cabeçalhos e &lt;p&gt; para parágrafos. Tags como &lt;strong&gt; e &lt;ul&gt; &lt;li&gt; também são seguras.</p>
                          </div>

                          <div className="flex items-center gap-3 pt-2">
                            <button
                              type="submit"
                              disabled={loading}
                              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-slate-900 px-5 py-2.5 rounded-xl font-bold text-xs transition-all disabled:opacity-50"
                            >
                              {loading ? 'A Gravar...' : 'Gravar Alterações'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPageSlug(null)}
                              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-750 text-slate-350 rounded-xl text-xs font-semibold cursor-pointer"
                            >
                              Fechar
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="lg:col-span-8 bg-white/30 border border-slate-200 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                        <FileText className="w-12 h-12 text-slate-800 mb-4" />
                        <h4 className="text-slate-500 font-bold mb-2">Editor de Conteúdo Estático</h4>
                        <p className="text-slate-600 text-xs">Selecione uma página no painel lateral à esquerda para iniciar a edição do seu conteúdo em direto na plataforma.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION 9: FUNIL DE CONVERSÃO & ABANDONOS          */}
              {/* ==================================================== */}
              {activeTab === 'funnel' && (() => {
                const abandonedLeads = salons.filter(sal => 
                  sal.onboarding_step !== undefined && 
                  sal.onboarding_step !== null && 
                  sal.onboarding_step < 5 && 
                  !sal.setup_completed
                );

                // Calculations
                const totalRegistrations = salons.length;
                const totalCompleted = salons.filter(s => s.setup_completed).length;
                const conversionRate = totalRegistrations > 0 ? ((totalCompleted / totalRegistrations) * 100).toFixed(1) : '0';
                const totalAbandoned = abandonedLeads.length;

                // Most abandoned step calculation
                const stepCounts = abandonedLeads.reduce((acc, lead) => {
                  const step = lead.onboarding_step || 1;
                  acc[step] = (acc[step] || 0) + 1;
                  return acc;
                }, {} as Record<number, number>);

                let mostAbandonedStep = "Nenhum";
                let maxCount = 0;
                const stepNames: Record<number, string> = {
                  1: "Detalhes do Negócio (Passo 1)",
                  2: "Catálogo de Serviços (Passo 2)",
                  3: "Seleção de Plano (Passo 3)",
                  4: "Pagamento / Checkout (Passo 4)"
                };

                Object.entries(stepCounts).forEach(([step, count]) => {
                  const countNum = count as number;
                  if (countNum > maxCount) {
                    maxCount = countNum;
                    mostAbandonedStep = stepNames[Number(step)] || `Passo ${step}`;
                  }
                });

                // Potential monthly recurring revenue lost
                const potentialRevenueLost = totalAbandoned * 19.90;

                return (
                  <div id="admin-funnel" className="space-y-6 animate-fade-in font-sans">
                    {/* Header */}
                    <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                          <span>Funil de Conversão & Recuperação de Leads</span>
                          <span className="text-xs bg-amber-50 text-amber-700 font-mono font-bold px-2.5 py-1 rounded-full border border-amber-200">
                            ⚠️ Tracking Activo
                          </span>
                        </h3>
                        <p className="text-xs text-slate-605 mt-0.5">
                          Identifique parceiros que abandonaram o registo a meio do assistente e estabeleça contacto para apoio ou fecho manual.
                        </p>
                      </div>

                      <button
                        onClick={syncAdminDatasets}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-105 border border-slate-200 rounded-xl text-slate-600 text-xs font-bold font-mono cursor-pointer transition-all self-start"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>Sincronizar Leads</span>
                      </button>
                    </div>

                    {/* Funnel Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Stat Card 1 */}
                      <div className="bg-white border border-slate-200 p-5 rounded-3xl">
                        <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-extrabold mb-1">Leads Abandonadas</span>
                        <div className="flex items-baseline gap-2.5">
                          <span className="text-3xl font-black text-slate-900 tracking-tight">{totalAbandoned}</span>
                          <span className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-200/50 px-1.5 py-0.5 rounded-md">
                            Onboarding Incompleto
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 font-medium">Parceiros registados pendentes de ativação comercial.</p>
                      </div>

                      {/* Stat Card 2 */}
                      <div className="bg-white border border-slate-200 p-5 rounded-3xl">
                        <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-extrabold mb-1">Taxa de Conversão</span>
                        <div className="flex items-baseline gap-2.5">
                          <span className="text-3xl font-black text-slate-900 tracking-tight">{conversionRate}%</span>
                          <span className="text-[10px] text-purple-705 font-bold bg-purple-950/20 border border-purple-900/35 px-1.5 py-0.5 rounded-md">
                            SaaS Target
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 font-medium">De {totalRegistrations} registos totais na base cadastral.</p>
                      </div>

                      {/* Stat Card 3 */}
                      <div className="bg-white border border-slate-200 p-5 rounded-3xl">
                        <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-extrabold mb-1">Ponto Mais Crítico</span>
                        <div className="flex items-baseline gap-2.5">
                          <span className="text-sm font-black text-slate-900 truncate tracking-tight">{mostAbandonedStep}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 font-medium">
                          {maxCount > 0 ? `Concentra ${maxCount} abandono(s) do funil.` : "Sem registos de desistência."}
                        </p>
                      </div>

                      {/* Stat Card 4 */}
                      <div className="bg-white border border-slate-200 p-5 rounded-3xl">
                        <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider font-extrabold mb-1">Faturação Recorrente Perdida</span>
                        <div className="flex items-baseline gap-2.5">
                          <span className="text-3xl font-black text-rose-600 tracking-tight">{potentialRevenueLost.toFixed(2)} €</span>
                          <span className="text-[9px] text-slate-400 font-mono font-bold">/mês</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 font-medium">Assumindo o plano PRO base (19.90 €/mês por parceiro).</p>
                      </div>
                    </div>

                    {/* Leads List Table */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider font-mono">
                          📋 Registo Detalhado de Leads ({totalAbandoned})
                        </h4>
                        <span className="text-[9px] font-mono uppercase bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">
                          Pendentes de Recuperação
                        </span>
                      </div>

                      {totalAbandoned === 0 ? (
                        <div className="py-12 text-center">
                          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                          <p className="text-slate-800 font-bold text-sm">Sem abandonos registados!</p>
                          <p className="text-slate-500 text-xs mt-1">Todos os seus parceiros concluíram ou não iniciaram passos pendentes.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-100 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                                <th className="py-3 px-4 font-bold">Parceiro / Dono</th>
                                <th className="py-3 px-4 font-bold">Data de Registo</th>
                                <th className="py-3 px-4 font-bold">Passo Abandonado</th>
                                <th className="py-3 px-4 font-bold">Contacto Principal</th>
                                <th className="py-3 px-4 text-right font-bold">Ações de Recuperação</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                              {abandonedLeads.map((lead) => {
                                const step = lead.onboarding_step || 1;
                                const stepLabel = stepNames[step] || `Passo ${step}`;

                                // E-mail mailto dynamic construction
                                const emailSubject = encodeURIComponent("Complete o registo do seu salão no Glamzo!");
                                const emailBody = encodeURIComponent(
                                  `Olá!\n\nNotámos que iniciou o registo do seu espaço no Glamzo, mas não concluiu o processo.\nComo o podemos ajudar a começar a receber marcações online e a automatizar a sua agenda comercial?\n\nSe desejar, pode retomar o seu assistente de configuração a partir de onde parou acedendo a:\nhttps://glamzo.pt/partner/setup\n\nFicamos inteiramente à sua disposição para esclarecer qualquer dúvida!\n\nCom os melhores cumprimentos,\nEquipa Glamzo`
                                );
                                const mailtoLink = `mailto:${lead.email}?subject=${emailSubject}&body=${emailBody}`;

                                // WhatsApp message dynamic construction
                                const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
                                const waMessage = encodeURIComponent(
                                  `Olá! Notámos que iniciou o registo do seu salão no Glamzo. Ficou com alguma dúvida ou precisa de apoio para configurar a sua agenda? Estamos aqui para o ajudar!`
                                );
                                const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${waMessage}` : null;

                                return (
                                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                                    {/* Partner / Owner */}
                                    <td className="py-3.5 px-4">
                                      <div className="font-extrabold text-slate-900">
                                        {lead.name || <span className="text-slate-450 italic font-medium">Estabelecimento por nomear</span>}
                                      </div>
                                      <div className="text-[10px] text-slate-500 font-mono mt-0.5 select-all">
                                        {lead.email}
                                      </div>
                                    </td>

                                    {/* Created At */}
                                    <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                                      {new Date(lead.created_at).toLocaleDateString('pt-PT')}
                                      <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                                        {new Date(lead.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </td>

                                    {/* Abandoned Step Progress indicator */}
                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                      <div className="flex items-center gap-2">
                                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                                          <div 
                                            className="bg-amber-500 h-full rounded-full transition-all" 
                                            style={{ width: `${(step / 4) * 100}%` }}
                                          />
                                        </div>
                                        <span className="text-[10px] font-bold text-amber-750 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-full">
                                          {stepLabel}
                                        </span>
                                      </div>
                                    </td>

                                    {/* Main contact */}
                                    <td className="py-3.5 px-4 font-mono font-medium whitespace-nowrap">
                                      {lead.phone || <span className="text-slate-400 italic font-medium">Sem telefone</span>}
                                    </td>

                                    {/* Action recovery buttons */}
                                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                      <div className="flex items-center justify-end gap-1.5">
                                        {/* Copy email option */}
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(lead.email || '');
                                            setSuccessMsg(`E-mail de ${lead.name || 'lead'} copiado para a área de transferência!`);
                                            setTimeout(() => setSuccessMsg(''), 3000);
                                          }}
                                          title="Copiar E-mail"
                                          className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-all cursor-pointer"
                                        >
                                          <Settings className="w-3.5 h-3.5" />
                                        </button>

                                        {/* Email Mailto button */}
                                        <a
                                          href={mailtoLink}
                                          title="Enviar Email de Recuperação (Manual)"
                                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-purple-950 hover:bg-purple-900 text-purple-700 border border-purple-900/40 rounded-xl transition-all font-bold text-[10px]"
                                        >
                                          <Mail className="w-3.5 h-3.5 text-purple-500" />
                                          <span>E-mail (Manual)</span>
                                        </a>

                                        {/* Resend Automated Email Button */}
                                        <button
                                          onClick={async () => {
                                            if (sendingEmails[lead.email]) return;
                                            setSendingEmails(prev => ({ ...prev, [lead.email]: true }));
                                            try {
                                              const ok = await sendAbandonedCartEmail(lead.email);
                                              if (ok) {
                                                setSuccessMsg(`E-mail de recuperação enviado com sucesso para ${lead.email}!`);
                                              } else {
                                                setErrorMsg(`Falha ao enviar e-mail de recuperação para ${lead.email}.`);
                                              }
                                            } catch (err: any) {
                                              setErrorMsg(`Erro: ${err.message || err}`);
                                            } finally {
                                              setSendingEmails(prev => ({ ...prev, [lead.email]: false }));
                                              setTimeout(() => {
                                                setSuccessMsg(null);
                                                setErrorMsg(null);
                                              }, 5000);
                                            }
                                          }}
                                          disabled={sendingEmails[lead.email]}
                                          title="Enviar E-mail de Recuperação Automatizado"
                                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all font-bold text-[10px] border cursor-pointer ${
                                            sendingEmails[lead.email]
                                              ? 'bg-slate-100 text-slate-400 border-slate-200'
                                              : 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500'
                                          }`}
                                        >
                                          {sendingEmails[lead.email] ? (
                                            <>
                                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                              <span>Enviando...</span>
                                            </>
                                          ) : (
                                            <>
                                              <Mail className="w-3.5 h-3.5" />
                                              <span>Enviar E-mail de Recuperação</span>
                                            </>
                                          )}
                                        </button>

                                        {/* WhatsApp Direct */}
                                        {waLink ? (
                                          <a
                                            href={waLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            title="Contactar via WhatsApp"
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-600 border border-emerald-900/40 rounded-xl transition-all font-bold text-[10px]"
                                          >
                                            <span>WhatsApp</span>
                                          </a>
                                        ) : (
                                          <span className="px-2.5 py-1.5 text-slate-350 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold cursor-not-allowed">
                                            WhatsApp
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </>
          )}

        </div>
      </main>

            {/* Detailed Modal to inspect All Salon Data Inserido pela Loja (Painel Elite) */}
      {selectedSalon && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop screen blur */}
          <div 
            onClick={() => setSelectedSalon(null)} 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity cursor-pointer" 
          />
          
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center text-slate-900 text-lg font-bold">
                  {selectedSalon.logo_url ? (
                    <img loading="lazy" referrerPolicy="no-referrer" src={selectedSalon.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    selectedSalon.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">{selectedSalon.name}</h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {selectedSalon.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSalon(null)}
                className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-100 px-6 gap-6 bg-white shrink-0 overflow-x-auto custom-scrollbar">
              <button onClick={() => setEliteTab('overview')} className={`py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${eliteTab === 'overview' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-slate-500 hover:text-slate-900'}`}>Visão Geral</button>
              <button onClick={() => setEliteTab('stripe')} className={`py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${eliteTab === 'stripe' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-slate-500 hover:text-slate-900'}`}>Faturação Stripe</button>
              <button onClick={() => setEliteTab('catalog')} className={`py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${eliteTab === 'catalog' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-slate-500 hover:text-slate-900'}`}>Catálogo & Equipa</button>
              <button onClick={() => { setEliteTab('edit'); handleStartEditSalon(selectedSalon); }} className={`py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${eliteTab === 'edit' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-slate-500 hover:text-slate-900'}`}>Editar Loja</button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              {eliteTab === 'overview' && (
                <div className="space-y-6">
                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleToggleSalonVerification(selectedSalon.id, selectedSalon.is_verified)} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-purple-300 transition-all flex flex-col gap-2 items-center text-center">
                      <ShieldAlert className={`w-6 h-6 ${selectedSalon.is_verified ? 'text-blue-500' : 'text-slate-400'}`} />
                      <span className="font-bold text-[11px] text-slate-700 uppercase tracking-widest">{selectedSalon.is_verified ? 'Retirar Homologação' : 'Homologar Loja'}</span>
                    </button>
                    {selectedSalon.status === 'suspended' ? (
                      <button onClick={() => handleReactivatePartner(selectedSalon.id)} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-300 transition-all flex flex-col gap-2 items-center text-center">
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                        <span className="font-bold text-[11px] text-slate-700 uppercase tracking-widest">Reativar Conta</span>
                      </button>
                    ) : (
                      <button onClick={() => handleSuspendPartner(selectedSalon.id)} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-rose-300 transition-all flex flex-col gap-2 items-center text-center">
                        <AlertTriangle className="w-6 h-6 text-rose-500" />
                        <span className="font-bold text-[11px] text-slate-700 uppercase tracking-widest">Suspender Conta</span>
                      </button>
                    )}
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-purple-600" /> Detalhes & Contactos</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div><p className="text-slate-500 font-bold mb-1">Telefone</p><p className="font-mono text-slate-900">{selectedSalon.phone || 'N/A'}</p></div>
                      <div><p className="text-slate-500 font-bold mb-1">Email Público</p><p className="font-mono text-slate-900 truncate">{selectedSalon.email || 'N/A'}</p></div>
                      <div><p className="text-slate-500 font-bold mb-1">Cidade</p><p className="font-bold text-slate-900 uppercase">{selectedSalon.city || 'N/A'}</p></div>
                      <div><p className="text-slate-500 font-bold mb-1">Morada</p><p className="text-slate-900">{selectedSalon.address || 'N/A'}</p></div>
                    </div>
                  </div>
                  
                  <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl">
                    <h3 className="font-black text-rose-900 text-sm flex items-center gap-2 mb-3"><Trash2 className="w-4 h-4" /> Zona de Perigo</h3>
                    <button 
                      onClick={() => {
                        setDeleteAccountTarget({ ownerId: selectedSalon.owner_id, businessId: selectedSalon.id, name: selectedSalon.name });
                        setDeleteAccountDoubleConfirmText('');
                        setDeleteAccountModalOpen(true);
                      }}
                      className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-rose-900/20"
                    >
                      Eliminar Conta & Dados
                    </button>
                  </div>
                </div>
              )}

              {eliteTab === 'stripe' && (
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><Award className="w-4 h-4 text-purple-600" /> Assinatura</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Plano Atual</p>
                        <p className="text-sm font-black text-slate-900">{selectedSalon.selected_plan_name || 'Comissionado Base'}</p>
                      </div>
                      {selectedSalon.is_premium ? (
                        <button onClick={() => handleRemoveProManual(selectedSalon.id)} className="px-4 py-2 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-600 rounded-xl text-xs font-bold transition-all">Remover PRO</button>
                      ) : (
                        <button onClick={() => handleActivateProManual(selectedSalon.id)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-900/20">Ativar PRO</button>
                      )}
                    </div>
                  </div>

                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-600" /> Detalhes Stripe Connect</h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500 font-bold">Account ID</span><span className="font-mono text-slate-900 font-bold">{selectedSalon.stripe_account_id || 'Não conectado'}</span></div>
                      <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500 font-bold">Cobranças (charges_enabled)</span><span className={selectedSalon.charges_enabled ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>{selectedSalon.charges_enabled ? 'ATIVO' : 'INATIVO'}</span></div>
                      <div className="flex justify-between pb-1"><span className="text-slate-500 font-bold">Repasses (payouts_enabled)</span><span className={selectedSalon.payouts_enabled ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>{selectedSalon.payouts_enabled ? 'ATIVO' : 'INATIVO'}</span></div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-black text-slate-900 text-sm flex items-center gap-2"><ArrowRightLeft className="w-4 h-4 text-slate-600" /> Histórico de Payouts da Loja</h3>
                    <div className="space-y-2">
                      {payoutRequests.filter((p: any) => p.business_id === selectedSalon.id).length === 0 ? (
                        <p className="text-xs text-slate-500">Sem histórico de payouts para esta loja.</p>
                      ) : (
                        payoutRequests.filter((p: any) => p.business_id === selectedSalon.id).map((po: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div>
                              <p className="text-xs font-bold text-slate-900">{po.amount}€</p>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{po.date || 'Data desconhecida'}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                              po.status === 'pago' ? 'bg-emerald-100 text-emerald-700' : 
                              po.status === 'pendente' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {po.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  </div>
              )}

              {eliteTab === 'catalog' && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 bg-white border border-slate-200 rounded-3xl">
                  <Package className="w-12 h-12 mb-4 text-slate-300" />
                  <p className="text-sm font-bold text-slate-900">Catálogo Ocultado no Admin</p>
                  <p className="text-xs mt-1 text-center max-w-xs">Para visualizar serviços e horários desta loja, abra a sua página de perfil.</p>
                  <a href={`/${selectedSalon.slug}`} target="_blank" rel="noopener noreferrer" className="mt-4 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Abrir Página Pública
                  </a>
                </div>
              )}

              {eliteTab === 'edit' && editingSalon?.id === selectedSalon.id && (
                <form onSubmit={(e) => { e.preventDefault(); handleSaveEditSalon(e); }} className="space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div><label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">Nome do Salão</label><input type="text" value={editSalonName} onChange={e => setEditSalonName(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-purple-600" /></div>
                    <div><label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">Categoria Principal</label><input type="text" value={editSalonCategory} onChange={e => setEditSalonCategory(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-purple-600" /></div>
                    <div><label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">Descrição Curta</label><textarea value={editSalonDescription} onChange={e => setEditSalonDescription(e.target.value)} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:border-purple-600 resize-none" /></div>
                  </div>
                  
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div><label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">Telefone Contacto</label><input type="text" value={editSalonPhone} onChange={e => setEditSalonPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-purple-600" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">Distrito</label><input type="text" value={editSalonDistrict} onChange={e => setEditSalonDistrict(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-purple-600" /></div>
                      <div><label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">Cidade</label><input type="text" value={editSalonCity} onChange={e => setEditSalonCity(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-purple-600" /></div>
                    </div>
                    <div><label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">Morada Completa</label><input type="text" value={editSalonAddress} onChange={e => setEditSalonAddress(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none focus:border-purple-600" /></div>
                  </div>
                  
                  <button type="submit" disabled={isSaving} className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-purple-900/20 flex items-center justify-center gap-2">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    <span>Guardar Alterações</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. PREMIUM USER EDITING DIALOG MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-purple-200 rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-scale-up space-y-4">
            <button 
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                <span>Editar Utilizador {editingUser.email?.split('@')[0]}</span>
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5">Modifique o cadastro base de utilizador na base de dados.</p>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-600 mb-1.5 uppercase font-mono tracking-wide text-[10px]">Nome Completo</label>
                <input 
                  type="text" 
                  value={editUserName}
                  onChange={e => setEditUserName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none focus:border-purple-650"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1.5 uppercase font-mono tracking-wide text-[10px]">Endereço de E-mail</label>
                <input 
                  type="email" 
                  value={editUserEmail}
                  onChange={e => setEditUserEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none focus:border-purple-650 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1.5 uppercase font-mono tracking-wide text-[10px]">Nível de Privilégios (Função)</label>
                <select aria-label="Selecione uma opção" 
                  value={editUserRole}
                  onChange={e => setEditUserRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none focus:border-purple-650 cursor-pointer"
                >
                  <option value="customer">Customer (Cliente Comum)</option>
                  <option value="business">Business (Proprietário de Salão)</option>
                  <option value="admin">Admin (Administrador Maestro)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="submit" 
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-slate-900 font-black py-3 rounded-xl transition-all cursor-pointer uppercase tracking-wider text-[10px]"
                >
                  Salvar Alterações
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-slate-50 text-slate-450 hover:text-slate-900 py-3 border border-slate-200 rounded-xl transition-all cursor-pointer uppercase tracking-wider text-[10px]"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. PREMIUM SALON EDITING DIALOG MODAL */}
      {editingSalon && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-purple-200 rounded-3xl w-full max-w-lg p-6 relative shadow-2xl animate-scale-up space-y-4 my-8">
            <button 
              onClick={() => setEditingSalon(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <span>Editar Estabelecimento: {editingSalon.name}</span>
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5">Altere as informações exibidas da loja comercial no ecossistema.</p>
            </div>

            <form onSubmit={handleSaveEditSalon} className="space-y-4 text-xs font-semibold max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-1.5 uppercase font-mono tracking-wide text-[10px]">Nome do Salão</label>
                  <input 
                    type="text" 
                    value={editSalonName}
                    onChange={e => setEditSalonName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none focus:border-purple-650"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1.5 uppercase font-mono tracking-wide text-[10px]">Categoria Principal</label>
                  <select aria-label="Selecione uma opção" 
                    value={editSalonCategory}
                    onChange={e => setEditSalonCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none focus:border-purple-650 cursor-pointer"
                  >
                    <option value="Cabelo">Cabelo (Cabeleireiro, Barbearia)</option>
                    <option value="Unhas">Unhas (Manicure, Pedicure)</option>
                    <option value="Sobrancelhas">Sobrancelhas (Design, Threading)</option>
                    <option value="Estética">Estética (Facial, Corporal)</option>
                    <option value="Massagem">Massagem (Relaxamento, Terapêutica)</option>
                    <option value="Maquilhagem">Maquilhagem</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-1.5 uppercase font-mono tracking-wide text-[10px]">Contacto Telefónico</label>
                  <input 
                    type="text" 
                    value={editSalonPhone}
                    onChange={e => setEditSalonPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none focus:border-purple-655 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1.5 uppercase font-mono tracking-wide text-[10px]">Concelho / Distrito</label>
                  <input 
                    type="text" 
                    value={editSalonDistrict}
                    onChange={e => setEditSalonDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none focus:border-purple-655"
                    placeholder="Ex: Lisboa, Porto, Braga..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-1.5 uppercase font-mono tracking-wide text-[10px]">Cidade / Localidade</label>
                  <input 
                    type="text" 
                    value={editSalonCity}
                    onChange={e => setEditSalonCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none focus:border-purple-650"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1.5 uppercase font-mono tracking-wide text-[10px]">Endereço Físico</label>
                  <input 
                    type="text" 
                    value={editSalonAddress}
                    onChange={e => setEditSalonAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none focus:border-purple-650"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1.5 uppercase font-mono tracking-wide text-[10px]">Breve Descrição Institucional</label>
                <textarea 
                  value={editSalonDescription}
                  onChange={e => setEditSalonDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none focus:border-purple-650 h-24 resize-none font-sans"
                  placeholder="Introduzir slogan ou breve texto explicativo..."
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="submit" 
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-slate-900 font-black py-3 rounded-xl transition-all cursor-pointer uppercase tracking-wider text-[10px]"
                >
                  Salvar Loja
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingSalon(null)}
                  className="flex-1 bg-slate-50 text-slate-450 hover:text-slate-900 py-3 border border-slate-200 rounded-xl transition-all cursor-pointer uppercase tracking-wider text-[10px]"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOUBLE CONFIRMATION PARTNER ACCOUNT DELETION MODAL */}
      {deleteAccountModalOpen && deleteAccountTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border-2 border-rose-600/30 rounded-3xl w-full max-w-md p-6 relative shadow-2xl space-y-4">
            <button 
              onClick={() => {
                setDeleteAccountModalOpen(false);
                setDeleteAccountTarget(null);
                setDeleteAccountDoubleConfirmText('');
              }}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-rose-950/50 rounded-full flex items-center justify-center text-rose-500 mx-auto border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-rose-500 uppercase tracking-wider">Confirmação de Segurança</h3>
              <p className="text-xs text-slate-600">
                Está prestes a eliminar DEFINITIVAMENTE a conta do parceiro <strong className="text-slate-900">{deleteAccountTarget.name}</strong>.
              </p>
              <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl text-left">
                <p className="text-[10px] text-rose-300 font-bold leading-relaxed">
                  ⚠️ AVISO MASTER: Esta operação executa uma limpeza em cascata integral e irreversível de:
                </p>
                <ul className="list-disc pl-4 text-[10px] text-slate-600 font-semibold mt-1.5 space-y-1">
                  <li>Todas as marcações e históricos (bookings, payments)</li>
                  <li>Dados operacionais (services, staff, business hours, locations)</li>
                  <li>Recursos de fidelidade e marketing (loyalty, campaigns)</li>
                  <li>O registo de subscrição e ligações de sincronismo Stripe</li>
                  <li>O utilizador associado de forma permanente no ecossistema</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3.5 pt-2">
              <p className="text-[10px] text-slate-600 text-center font-bold">
                Para prosseguir com o apagamento definitivo, escreva <span className="text-rose-400 select-all font-mono">ELIMINAR</span> abaixo:
              </p>

              <input
                type="text"
                value={deleteAccountDoubleConfirmText}
                onChange={(e) => setDeleteAccountDoubleConfirmText(e.target.value)}
                placeholder="Escreva ELIMINAR para prosseguir"
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-900 outline-none focus:border-rose-600 text-center font-mono placeholder-slate-650"
              />

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  disabled={deleteAccountDoubleConfirmText !== 'ELIMINAR'}
                  onClick={() => executeCompleteCascadeAccountDeletion(deleteAccountTarget.ownerId, deleteAccountTarget.businessId)}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-20 disabled:hover:bg-rose-600 text-slate-900 font-black py-3 rounded-xl transition-all cursor-pointer uppercase tracking-wider text-[10px]"
                >
                  Confirmar Eliminação
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteAccountModalOpen(false);
                    setDeleteAccountTarget(null);
                    setDeleteAccountDoubleConfirmText('');
                  }}
                  className="flex-1 bg-slate-50 text-slate-600 hover:text-slate-900 py-3 border border-slate-850 rounded-xl transition-all cursor-pointer uppercase tracking-wider text-[10px]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
