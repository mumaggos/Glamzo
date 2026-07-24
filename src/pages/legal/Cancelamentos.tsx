import React from 'react';
import DynamicLegalPage from '../../components/DynamicLegalPage';

export default function Cancelamentos() {
  return (
    <DynamicLegalPage 
      slug="politica-de-cancelamentos"
      defaultTitle="Política de Cancelamentos e Reembolsos" 
      defaultLastUpdated="18 de Junho de 2026"
      defaultContent={
        <>
          <p>
            A Glamzo pretende proporcionar uma relação de compromisso e respeito entre todos os Clientes e Salões. A não comparência ou as alterações em cima da hora trazem perdas substanciais de rendimento aos Parceiros.
          </p>

      <h2>1. Regras para Clientes</h2>
      <p>
        Quando o Cliente agenda um serviço, o Parceiro bloqueia o tempo da sua agenda, impossibilitando que outros clientes tomem essa vaga. 
      </p>
      <ul>
        <li><strong>Cancelamentos Atempados:</strong> Geralmente, os clientes têm liberdade total para cancelar sua marcação online, de forma totalmente gratuita, e com reembolso a 100% (se pré-pago) desde que o façam fora da Janela de Tolerância estipulada.</li>
        <li><strong>Janela de Tolerância:</strong> Cada salão parceiro tem a obrigatoriedade de decidir e exibir a sua própria política do limite horário (ex. cancelamento gratuito apenas até 24 ou 48 horas antes da sessão). Este limite é exibido claramente no momento do agendamento.</li>
      </ul>

      <h2>2. Cancelamentos Tardios e Não Comparência ("No-Show")</h2>
      <p>
        Caso um Cliente cancele depois de ultrapassada a Janela de Tolerância estabelecida pelo parceiro, ou em alternativa, caso o Cliente não compareça de todo no estabelecimento físico de marcação:
      </p>
      <ul>
        <li>O Parceiro reserva-se ao direito de aplicar as multas protocolares, que podem variar de retenção parcial a retenção integral do valor do serviço acordado.</li>
        <li>Se o pagamento não tiver ocorrido no momento da reserva (em pagamentos "Pagamento no Local"), a plataforma poderá solicitar e processar o cartão usado como caução (se exigido nas regras pré-acertadas do salão).</li>
      </ul>

      <h2>3. Regras e Garantias de Parceiros</h2>
      <p>
        Apesar de infrequentes, os Parceiros podem deparar-se com contratempos graves de gestão ou motivo de força maior, sendo obrigados a cancelar uma marcação do seu lado.
      </p>
      <ul>
        <li>O Cliente que for alvo de um cancelamento por intervenção da parte exclusiva de um profissional será reembolsado na totalidade ou reagendado sob comum acordo.</li>
        <li>Os Parceiros comprometem-se a comunicar com bastante antecedência qualquer eventual problema mecânico ou laboral para minimizar incómodos.</li>
      </ul>

      <h2>4. Reembolsos</h2>
      <p>
        Quaisquer fundos elegíveis a retornar para a conta do Cliente, por falha, por cancelamento atempado ou recusa do Salão, serão devolvidos, via Stripe, num prazo temporal normal estimado que os bancos exigem e determinam (regra geral entre 3 a 10 dias úteis diretos para o IBAN / Cartão usado no pagamento). A Glamzo emitirá as ordens de retorno de fundos prontamente.
      </p>
        </>
      }
    />
  );
}
