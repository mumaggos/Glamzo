import React from 'react';
import { useTranslation } from 'react-i18next';
import DynamicLegalPage from '../../components/DynamicLegalPage';

export default function Seguranca() {
  const { t } = useTranslation();
  return (
    <DynamicLegalPage 
      slug="seguranca-e-protecao-de-dados"
      defaultTitle={t('Segurança e Proteção de Dados') || 'Segurança e Proteção de Dados'} 
      defaultLastUpdated="18 de Junho de 2026"
      defaultContent={
        <>
          <p>
            A transparência, a modernidade e a garantia de isolamento criptográfico são pedras balneares do crescimento comunitário na estrutura corporativa. Aqui descrevemos as vertentes robustas do serviço Glamzo.
          </p>

      <h2>1. Infraestruturas na Nuvem e Base de Dados</h2>
      <p>
        Para atingimento da performance adequada, isolamento geográfico e encriptação permanente na persistência de informação das contas:
      </p>
      <ul>
        <li>Centralizamos toda a gestão orgânica de clientes na ferramenta subjacente garantida pela tecnológica Supabase Ldt. (Plataforma relacional open-source orientada sobre Postgres).</li>
        <li>Isolamos o backend físico (dados de repouso) sobre solo jurisdicional pertencente ao espaço económico europeu (Europa-Ocidental).</li>
      </ul>

      <h2>2. Redes Isoladas Sem Confiança Total (Zero-Trust/RLS)</h2>
      <p>
        A informação na nossa gestão de Base de Dados utiliza protocolos e arquiteturas fortes implementados pelo padrão "Row Level Security" (Segurança ao nível do registo).
        O que quer dizer que por concepção matriz do servidor: um cliente, ou um atacante com posse à autenticação desse cliente só lhe será respondido, via API, aos registos (marcações, saldo, cartões) cujo ID em específico se relacione à conta logada (criptografia de controlo de permissões isolado e não de software lógico de superfície).
      </p>

      <h2>3. Dados Transacionados por Cartões</h2>
      <p>
        Nenhum desenvolvedor corporativo, proprietário da plataforma ou profissional de banco de base de dados afiliado no ecossistema de operação técnica e apoio informático na Glamzo possuirá (em parte nenhuma, de modo visível ou ofuscado) visualização aos seus CVC's ou panóplia do seu número digital de crédito/débito. Apenas os provedores de serviços financeiros (Banco Intermediário da Stripe) possui e retém esta comunicação na cloud PCI-Compliance.
      </p>
        </>
      }
    />
  );
}
