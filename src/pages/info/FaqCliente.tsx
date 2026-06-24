import React from 'react';
import ContentLayout from '../../components/ContentLayout';

export default function FaqCliente() {
  return (
    <ContentLayout title="Perguntas Frequentes (FAQ) - Cliente">
      <p>Bem-vindo à área de ajuda rápida ao cliente. Encontre abaixo as soluções e instruções mais solicitadas.</p>

      <h2>1. Como fazer uma marcação?</h2>
      <p>
        Pode iniciar navegando pelas listas segmentadas das áreas de estéticas localizadas perto da área da sua localidade no nosso explorador da página principal ("Encontrar Salões"). Selecionará após a decisão do local a lista preçário de catálogo pretendido, depois avançará até uma data calendário do funcionário apto com hora exata acordada e findará o processamento no Checkout seguro ao finalizar o carrinho.
      </p>

      <h2>2. Posso efetuar cancelamentos após pagar?</h2>
      <p>
        Totalmente. Dentro dos dias do painel (Exemplo: 48 horas protetivas das regras acordadas no Salão de beleza em si) deve clicar no ícone do Utilizador (cimo do painel com sua foto de perfil), em "Os Meus Agendamentos", selecione e confirme sob a modalidade da opção visual de "Cancelar" reserva na própria interface da app.
      </p>
      
      <h2>3. Os meus dados de pagamento estão em risco? Como pagar?</h2>
      <p>
        Para confirmar uma reserva paga adiantada utilizamos um dos maiores provedores da internet (Stripe), a sua segurança sobre pagamento é intransponível (CVC e chaves creditícias não tocam nos servidores de base de dados geridos por nós na Render / Supabase). A interface apresenta MBWAY (exibido na Stripe a nível europeu sob Multibanco/SEPA, caso abrangente pela região) ou uso tradicional dos seus cartões de crédito/débito. 
      </p>

      <h2>4. Como posso contactar o salão antes do compromisso?</h2>
      <p>
        O perfil singular de cada loja / negócio (visualizável no portfólio de exploração ou até mesmo na fatura dos seus emails interativos de pós-processamento) dispões de toda a estrutura pública preenchida por esse mesmo negócio (Números Tlm., descrições e Localidade Geográfica para rotas e conversas com a gerência do espaço físico). Pode, contudo, também resolver tudo com a Glamzo!
      </p>
    </ContentLayout>
  );
}
