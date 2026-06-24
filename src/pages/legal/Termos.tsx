import React from 'react';
import ContentLayout from '../../components/ContentLayout';

export default function Termos() {
  return (
    <ContentLayout title="Termos e Condições" lastUpdated="18 de Junho de 2026">
      <p>
        Bem-vindo à Glamzo. Estes Termos e Condições regem o acesso e a utilização do nosso marketplace e plataforma digital, concebidos para ligar clientes a profissionais e salões de beleza em Portugal e na União Europeia.
      </p>

      <h2>1. Utilização da Plataforma</h2>
      <p>
        O acesso e uso da Glamzo implicam a aceitação plena e sem reservas das presentes condições. A plataforma destina-se ao agendamento de serviços de beleza, estética e bem-estar, facilitando a interação entre Clientes ("Utilizadores") e Salões/Profissionais ("Parceiros").
      </p>

      <h2>2. Criação de Conta</h2>
      <p>
        Para efetuar marcações ou configurar um perfil de parceiro, o utilizador deverá criar uma conta. É responsável por manter a confidencialidade das suas credenciais (email e palavra-passe) geridas através do nosso fornecedor seguro de autenticação. É estritamente proibida a criação de contas com dados falsos.
      </p>

      <h2>3. Responsabilidade dos Salões (Parceiros)</h2>
      <p>
        Os Parceiros são inteiramente responsáveis pela veracidade e precisão da informação publicitada nos seus perfis, incluindo preçários, disponibilidade, morada e duração dos serviços. Os Parceiros comprometem-se a prestar os serviços aos Clientes com o mais alto padrão de profissionalismo e higiene, cumprindo a legislação laboral e sanitária aplicável.
      </p>

      <h2>4. Responsabilidade dos Clientes</h2>
      <p>
        Os Clientes comprometem-se a comparecer na hora e local indicados na sua marcação, respeitando as normas do estabelecimento do Parceiro. Devem garantir que os dados de pagamento utilizados nos métodos partilhados através do nosso processador Stripe são legítimos e têm os fundos necessários.
      </p>

      <h2>5. Pagamentos</h2>
      <p>
        Todos os pagamentos online são processados de forma segura pela Stripe e encaminhados via Stripe Connect quando aplicável. A Glamzo não armazena dados de cartões de crédito. Ao realizar uma marcação, o cliente aceita que a Glamzo poderá atuar como agente de cobrança em nome do Parceiro.
      </p>

      <h2>6. Cancelamentos e Reembolsos</h2>
      <p>
        As condições de cancelamento variam conforme as definições estipuladas por cada Parceiro no seu perfil. Por favor, consulte a nossa Política de Cancelamentos e Reembolsos para detalhes abrangentes sobre não comparências ("no-shows"), cancelamentos tardios e devolução de valores pré-pagos.
      </p>

      <h2>7. Conteúdo Publicado</h2>
      <p>
        As fotografias, descrições e avaliações inseridas pelos Utilizadores ou Parceiros devem respeitar as boas práticas de convivência e a legislação vigente. A Glamzo reserva-se o direito de remover qualquer conteúdo considerado difamatório, inadequado, ofensivo ou enganador.
      </p>

      <h2>8. Suspensão de Contas</h2>
      <p>
        Reservamo-nos o direito de suspender temporária ou definitivamente qualquer conta (Cliente ou Parceiro) que incumpra os presentes Termos, efetue ações fraudulentas ou cause prejuízos à Glamzo ou a terceiros.
      </p>

      <h2>9. Limitação de Responsabilidade</h2>
      <p>
        A Glamzo atua como um facilitador técnico e marketplace. Não prestamos diretamente os serviços de beleza. Deste modo, não nos responsabilizamos por falhas na execução do serviço, reações alérgicas, disputas entre o Cliente e o Parceiro ou alterações de última hora efetuadas pelas partes. Os Parceiros assumem responsabilidade integral pelos serviços prestados nas suas instalações.
      </p>

      <h2>10. Legislação Aplicável e Foro competente</h2>
      <p>
        Estes Termos e Condições são regulados pela lei Portuguesa. Para resolução de qualquer litígio resultante da interpretação ou execução dos presentes Termos, o foro competente será o Tribunal da Comarca de Lisboa, com renúncia a qualquer outro.
      </p>
    </ContentLayout>
  );
}
