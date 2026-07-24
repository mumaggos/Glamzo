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
            
                              {t('txt_a_transpar_ncia_a_modernidade') || 'A transparência, a modernidade e a garantia de isolamento criptográfico são pedras balneares do crescimento comunitário na estrutura corporativa. Aqui descrevemos as vertentes robustas do serviço Glamzo.'}
                            </p>

      <h2>{t('txt_1_infraestruturas_na_nuvem_e_b') || '1. Infraestruturas na Nuvem e Base de Dados'}</h2>
      <p>
        
                          {t('txt_para_atingimento_da_performanc') || 'Para atingimento da performance adequada, isolamento geográfico e encriptação permanente na persistência de informação das contas:'}
                        </p>
      <ul>
        <li>{t('txt_centralizamos_toda_a_gest_o_or') || 'Centralizamos toda a gestão orgânica de clientes na ferramenta subjacente garantida pela tecnológica Supabase Ldt. (Plataforma relacional open-source orientada sobre Postgres).'}</li>
        <li>{t('txt_isolamos_o_backend_f_sico_dado') || 'Isolamos o backend físico (dados de repouso) sobre solo jurisdicional pertencente ao espaço económico europeu (Europa-Ocidental).'}</li>
      </ul>

      <h2>{t('txt_2_redes_isoladas_sem_confian_a') || '2. Redes Isoladas Sem Confiança Total (Zero-Trust/RLS)'}</h2>
      <p>
        
                          {t('txt_a_informa_o_na_nossa_gest_o_de') || 'A informação na nossa gestão de Base de Dados utiliza protocolos e arquiteturas fortes implementados pelo padrão "Row Level Security" (Segurança ao nível do registo). O que quer dizer que por concepção matriz do servidor: um cliente, ou um atacante com posse à autenticação desse cliente só lhe será respondido, via API, aos registos (marcações, saldo, cartões) cujo ID em específico se relacione à conta logada (criptografia de controlo de permissões isolado e não de software lógico de superfície).'}
                        </p>

      <h2>{t('txt_3_dados_transacionados_por_car') || '3. Dados Transacionados por Cartões'}</h2>
      <p>
        
                          {t('txt_nenhum_desenvolvedor_corporati') || 'Nenhum desenvolvedor corporativo, proprietário da plataforma ou profissional de banco de base de dados afiliado no ecossistema de operação técnica e apoio informático na Glamzo possuirá (em parte nenhuma, de modo visível ou ofuscado) visualização aos seus CVC\'s ou panóplia do seu número digital de crédito/débito. Apenas os provedores de serviços financeiros (Banco Intermediário da Stripe) possui e retém esta comunicação na cloud PCI-Compliance.'}
                        </p>
        </>
      }
    />
  );
}
