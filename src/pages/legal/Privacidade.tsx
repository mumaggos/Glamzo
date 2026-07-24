import React from 'react';
import { useTranslation } from 'react-i18next';
import DynamicLegalPage from '../../components/DynamicLegalPage';

export default function Privacidade() {
    const { t } = useTranslation();
  return (
    <DynamicLegalPage 
      slug="politica-de-privacidade"
      defaultTitle={t('Política de Privacidade') || 'Política de Privacidade'} 
      defaultLastUpdated="18 de Junho de 2026"
      defaultContent={
        <>
          <p>
            A proteção da sua privacidade é fundamental para a Glamzo. Esta Política de Privacidade explica como recolhemos, tratamos, protegemos e armazenamos os seus dados pessoais, em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD - Regulamento (UE) 2016/679).
          </p>

      <h2>1. Dados Recolhidos</h2>
      <p>A Glamzo recolhe e processa as seguintes categorias de dados pessoais:</p>
      <ul>
        <li><strong>Dados de Identificação:</strong> Nome, apelido, e-mail e número de telefone (necessário para lembretes e autenticação).</li>
        <li><strong>Dados de Perfil (Parceiros):</strong> Denominação social, NIF, morada física do espaço comercial, IBAN (através do Stripe Connect) e informações associadas à licença de funcionamento.</li>
        <li><strong>Dados de Agendamento:</strong> Histórico de marcações efetuadas, serviços selecionados, horários, profissionais preferenciais e o histórico de faturação.</li>
        <li><strong>Dados Técnicos e de Navegação:</strong> Endereço IP, tipo de dispositivo, navegador, páginas visitadas e tempos de sessão.</li>
      </ul>

      <h2>2. Finalidade do Tratamento</h2>
      <p>Os seus dados são tratados com as seguintes finalidades:</p>
      <ul>
        <li>Facilitar as reservas e agendamentos de serviços.</li>
        <li>Gerir contas de Cliente e contas de Parceiro.</li>
        <li>Processar pagamentos e transferências financeiras (subscrições ou repasses de comissões).</li>
        <li>Envio de notificações de transação (ex. confirmações de marcação, lembretes de calendário).</li>
        <li>Melhorar continuamente a segurança e as funcionalidades da plataforma.</li>
      </ul>

      <h2>3. Base Legal</h2>
      <p>
        Processamos os seus dados com base no seu <strong>consentimento expresso</strong> (quando cria uma conta), na <strong>execução de um contrato</strong> (processamento do seu agendamento ou contrato de Parceiro) e para o cumprimento de <strong>obrigações legais</strong> e <strong>interesses legítimos</strong> da Glamzo na manutenção de segurança da infraestrutura.
      </p>

      <h2>4. Conservação dos Dados</h2>
      <p>
        Os dados pessoais serão retidos pelo período estritamente necessário para cumprir as finalidades indicadas. Dados fiscais e associados a faturação serão mantidos pelos prazos exigidos pela legislação fiscal Portuguesa (geralmente até 10 anos). Se eliminar a sua conta, os seus dados não essenciais são apagados ou devidamente anonimizados em 30 dias.
      </p>

      <h2>5. Serviços Terceiros Utilizados (Processadores de Dados)</h2>
      <p>Para fornecer um serviço robusto e de alta escala, delegamos sub-processos especializados a plataformas que cumprem as exigências de tratamento de dados:</p>
      <ul>
        <li><strong>Supabase:</strong> A nossa base de dados primária e gestão de autenticação. Garante o isolamento de dados com políticas de acesso restritas e armazenamento encriptado, centralizado em servidores na União Europeia.</li>
        <li><strong>Stripe:</strong> O processador exclusivo de pagamentos. Nenhum dado do seu cartão é armazenado nos nossos servidores (nem pelo Supabase ou Render). A Stripe processa cartões de crédito e as contas de payout de Parceiros (Stripe Connect).</li>
        <li><strong>Render:</strong> Utilizamos a Render como plataforma estrutural (PaaS) que aloja as necessidades lógicas da app e serve pedidos com uma infraestrutura segura e encriptada.</li>
      </ul>

      <h2>6. Direitos GDPR (RGPD)</h2>
      <p>Todos os utilizadores têm os seguintes direitos perante a nossa plataforma:</p>
      <ul>
        <li><strong>Direito de Acesso:</strong> Obter a confirmação sobre quais dados seus estão a ser processados.</li>
        <li><strong>Direito de Retificação:</strong> Editar de forma livre no seu Perfil os seus dados caso estejam incorretos.</li>
        <li><strong>Direito ao Apagamento ("Direito a ser Esquecido"):</strong> Exigir a eliminação permanente da sua conta e registos associados.</li>
        <li><strong>Direito à Portabilidade:</strong> Obter uma cópia dos seus marcações e dados num formato digital estruturado.</li>
      </ul>

      <h2>7. Segurança e Proteção de Dados</h2>
      <p>
        Implementamos rigorosas práticas de segurança, como ligações encriptadas (HTTPS/TLS) por toda a nossa infraestrutura e garantimos separação relacional estrita entre os dados dos clientes e as infraestruturas dos salões (Row-Level Security) na nossa base de dados de produção.
      </p>

      <h2>8. Contacto para Proteção de Dados</h2>
      <p>
        Para qualquer dúvida relacionada com esta Política, para remover os seus dados, ou para o exercício dos seus direitos ao abrigo do RGPD, contacte a nossa equipa através de: <strong>glamzo.suporte@gmail.com</strong> com o assunto "RGPD e Proteção de Dados".
      </p>
        </>
      }
    />
  );
}
