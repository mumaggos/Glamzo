import React from 'react';
import { useTranslation } from 'react-i18next';
import DynamicLegalPage from '../../components/DynamicLegalPage';

export default function Cookies() {
    const { t } = useTranslation();
  return (
    <DynamicLegalPage 
      slug="politica-de-cookies"
      defaultTitle={t('Política de Cookies') || 'Política de Cookies'} 
      defaultLastUpdated="18 de Junho de 2026"
      defaultContent={
        <>
          <p>
            Esta página descreve como a plataforma Glamzo utiliza "cookies" e tecnologia semelhante para disponibilizar a melhor experiência a Clientes e Parceiros.
          </p>

      <h2>1. O que são os Cookies?</h2>
      <p>
        Cookies são pequenos ficheiros de texto transferidos para o seu dispositivo eletrónico (computador, smartphone ou tablet) pelo seu navegador de internet, a pedido dos servidores da nossa plataforma. Servem para garantir e reter o funcionamento da navegação, manter o seu login e reter preferências.
      </p>

      <h2>2. Os Nossos Cookies Essenciais</h2>
      <p>
        Na Glamzo, focamo-nos em garantir a máxima rapidez, segurança e fiabilidade. São estritamente necessários para permitir-lhe navegar no website e aplicar as funcionalidades chave (exemplo, manter a sessão de Cliente iniciada enquanto seleciona um salão). 
        <strong>Não exigem consentimento, pois a plataforma não consegue operar sem eles.</strong>
      </p>
      <ul>
        <li><strong>Autenticação Segura:</strong> Emitidos via Supabase, necessários para identificar o seu utilizador (sessão segura) para impedir acessos de terceiros.</li>
        <li><strong>Processamento Seguro:</strong> Emitidos pelo Stripe enquanto está num fluxo de entrada de pagamentos (são cookies cruciais para as exigências bancárias e anti-fraude).</li>
      </ul>

      <h2>3. Cookies Analíticos e de Performance</h2>
      <p>
        (Aguardamos a sua conformidade via Banner de Consentimento) <br />
        Para melhorar o layout dos nossos painéis de salões ou a experiência de pesquisa, poderemos pontualmente recolher dados orgânicos agregados e anónimos (taxas de cliques nalgum botão, rotas que quebram num erro), que ajudam diretamente a nossa equipa de engenharia a lançar novas versões livre de problemas.
      </p>

      <h2>4. Banner de Consentimento</h2>
      <p>
        Quando o utilizador visita a Glamzo pela primeira vez será notificado acerca desta configuração, permitindo a gestão em pleno e escolhendo bloquear a inserção dos de classe Analítica/Performance se assim o desejar.
      </p>

      <h2>5. Gestão de Cookies e Browser</h2>
      <p>
        A maioria dos navegadores (Google Chrome, Firefox, Safari) permitem total controlo sobre todos os cookies instalados, inclusivamente, limpar os persistentes. Pode revogar os cookies diretamente através das definições gerais de Privacidade do seu programa de navegação. 
      </p>
        </>
      }
    />
  );
}
