import React from 'react';
import { useTranslation } from 'react-i18next';
import DynamicLegalPage from '../../components/DynamicLegalPage';

export default function Pagamentos() {
  const { t } = useTranslation();
  return (
    <DynamicLegalPage 
      slug="politica-de-pagamentos"
      defaultTitle={t('Política de Pagamentos') || 'Política de Pagamentos'} 
      defaultLastUpdated="18 de Junho de 2026"
      defaultContent={
        <>
          <p>
            A Glamzo compromete-se com a fiabilidade absoluta em cada transação financeira gerada nas reservas comerciais, nas subscrições de aluguer da plataforma e no processamento de repasses de saldo às faturas dos Parceiros.
          </p>

      <h2>1. Pagamentos Processados pela Stripe</h2>
      <p>
        Para assegurar total segurança nas redes de débito e crédito, implementamos as redes de pagamentos da Stripe, Lda. Ao transacionar através da Plataforma (ex: inserir cartões, criar subscrições), estará subordinado obrigatoriamente às políticas europeias e regras de processamento e segurança garantidas pela Stripe.
      </p>

      <h2>2. Comissões da Plataforma</h2>
      <p>
        No modelo original (sem subscrição), a Glamzo aplica percentagens unitárias ou comissões mínimas de taxa administrativa por cada agendamento trazido e faturado na porta de um parceiro. Estas comissões aplicam-se apenas e de modo isolado contra o saldo credor faturado em nome dos Parceiros Comerciais; os Clientes apenas pagam o preço exato listado para os seus serviços desejados. 
      </p>

      <h2>3. Subscrições Glamzo PRO</h2>
      <p>
        Os Parceiros dispõem ainda de uma modalidade alternativa por Subscrição (Glamzo PRO). Nesse modelo:
      </p>
      <ul>
        <li>O Parceiro paga mensal ou anualmente um valor base predefinido que o isenta de uma maior incidência sobre comissões avulsas, ideal para grandes faturamentos em Salões de dimensão elevada.</li>
        <li>O cancelamento das subscrições por parte do Parceiro deve ocorrer até ou antes do termo do tempo remanescente da mensalidade já paga, para bloquear a faturação de continuidade antes do período de auto-renovação.</li>
      </ul>

      <h2>4. Falhas de Pagamento</h2>
      <p>
        Se um processamento ou a validade mensal da Stripe ditar e intercetar insuficiência de saldo, bloqueio na entidade bancária e impossibilidade de recuo de uma subscrição recorrente: 
        <br />
        O perfil profissional do parceiro na Glamzo poderá ficar restrito a reservas externas online para com o público geral até regularização e preenchimento atualizado em "Faturação e Métodos de Pagamento".
      </p>

      <h2>5. Faturação e Repasses de Salão</h2>
      <p>
        Todos os repasses e valores apurados retidos para entregar são processados pela plataforma Stripe Connect e diretamente redigidos, libertados ou depositados para a conta IBAN autorizada nas definições do Painel do Salão.
      </p>
        </>
      }
    />
  );
}
