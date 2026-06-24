import React from 'react';
import ContentLayout from '../../components/ContentLayout';

export default function Sobre() {
  return (
    <ContentLayout title="Sobre a Glamzo">
      <p className="lead text-xl text-slate-700 font-medium pb-4">
        A Glamzo é o seu novo ponto de encontro para a centralização ibérica (Portugal e UE) de beleza, bem-estar e gestão sofisticada de marcações para Salões premium.
      </p>

      <h2>O que fazemos</h2>
      <p>
        Operamos um mercado e plataforma robusta baseada em nuvem, concebidos especificamente para facilitar o contacto logístico sem fricção entre um Cliente focado nas marcações diárias e o negócio dinâmico pronto a acecionar valor, modernizando os espaços estéticos físicos das agendas arcaicas por cadernos e telefonemas de barulhos sem parar.
      </p>

      <h2>Benefícios</h2>
      <ul>
        <li>
          <strong>Para Clientes:</strong> Agendamentos 24 horas por dia, 7 dias por semana onde encontram de forma clara todas as avaliações, horários certos e o melhor portfólio dos Salões de modo desocupado e unificado em dispositivos móveis.
        </li>
        <li>
          <strong>Para Salões e Profissionais:</strong> Automações automáticas dos funis de controlo. Desde redução brutal das falhas e 'no-shows' não pagos, lembretes informáticos do controlo diário em e-mail / mensagens, uma simplificação imensa na hora repassar os valores Stripe aos próprios bancos (via subscrições ou comissões). 
        </li>
      </ul>

      <h2>A Nossa Missão, Visão e Valores (Comunidade)</h2>
      <p>
        <strong>A Missão:</strong> Acabar de uma vez com o constrangimento logístico de perdas de tempo nos telefones na altura de marcar horas. A Glamzo empodera o empreendedor logístico da beleza a modernizar sem um orçamento louco. 
      </p>
      <p>
        <strong>A Visão corporativa:</strong> Consolidar os nossos polos num único sistema moderno que dominará o aspeto comercial ibérico, focando primeiramente Portugal.
      </p>
      <p>
        <strong>Valores Humanos:</strong> Construímos laços reais com negócios reais. A Glamzo opera de maneira não focada só num negócio empresarial hostil sem presença: mantemos um estilo de comunicação quente, moderno e português focado no suporte contínuo dos Profissionais.
      </p>

      <h2>Tecnologia e Segurança (Dados / Pagamentos)</h2>
      <p>
        O nosso ecossistema moderno encontra-se desenhado nas tecnologias da vanguarda da geração. Da Base da Nuvem Supabase, às plataformas logísticas em Render até aos circuitos monetários criptográfricos do PCI-Compliance interconectados no portal mundial da Stripe, a sua navegação, a visualização da privacidade, e inserção do cartão bancário desfruta exatamente do nível mais apetrechado no panorama global para blindar o conforto de Clientes e Parceiros.
      </p>
    </ContentLayout>
  );
}
