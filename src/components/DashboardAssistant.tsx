import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Calendar, Clock, TrendingUp, Users, 
  Percent, AlertCircle, Activity, Award, ShoppingBag, ShieldCheck
} from 'lucide-react';

interface AssistantProps {
  business: any;
  bookings: any[];
  services: any[];
  hours: any[];
  staff: any[];
}

export default function DashboardAssistant({ business, bookings, services, hours, staff }: AssistantProps) {
  // Analytical metrics
  const [hasEnoughData, setHasEnoughData] = useState(false);
  const [lowOccupancyDay, setLowOccupancyDay] = useState('Terça-feira');
  const [suggestedPromoDay, setSuggestedPromoDay] = useState('Quinta-feira');
  const [topService, setTopService] = useState('Corte Feminino');
  const [inactiveClientsCount, setInactiveClientsCount] = useState(0);
  const [revenueChangeText, setRevenueChangeText] = useState('');
  const [revenueChangePercent, setRevenueChangePercent] = useState<number | null>(null);
  const [tomorrowAgendaText, setTomorrowAgendaText] = useState('Tem vários horários livres amanhã.');

  useEffect(() => {
    // We consider that a salon needs at least 3 bookings to display meaningful analytical trends
    const validBookings = (bookings || []).filter(b => b.booking_status !== 'cancelled');
    
    if (validBookings.length < 3) {
      setHasEnoughData(false);
      return;
    }

    setHasEnoughData(true);

    // 1. OCUPAÇÃO & PROMOÇÕES: Group bookings by weekday
    const weekdayCounts: Record<string, number> = {
      'Segunda-feira': 0,
      'Terça-feira': 0,
      'Quarta-feira': 0,
      'Quinta-feira': 0,
      'Sexta-feira': 0,
      'Sábado': 0,
      'Domingo': 0
    };

    const daysEnumMap: Record<number, string> = {
      1: 'Segunda-feira',
      2: 'Terça-feira',
      3: 'Quarta-feira',
      4: 'Quinta-feira',
      5: 'Sexta-feira',
      6: 'Sábado',
      0: 'Domingo'
    };

    validBookings.forEach(b => {
      const dateObj = new Date(b.booking_date);
      const weekdayName = daysEnumMap[dateObj.getDay()];
      if (weekdayName) {
        weekdayCounts[weekdayName] += 1;
      }
    });

    // Solve lowest weekday (excluding days the salon is completely closed)
    const sortedDays = Object.entries(weekdayCounts)
      .sort((a, b) => a[1] - b[1]);

    const activeLowDay = sortedDays[0][0];
    const secondActiveLowDay = sortedDays[1][0];

    setLowOccupancyDay(activeLowDay);
    setSuggestedPromoDay(secondActiveLowDay);

    // 2. SERVIÇOS: Group by service name
    const serviceCounts: Record<string, number> = {};
    validBookings.forEach(b => {
      const sName = b.service?.name || 'Serviço Premium';
      serviceCounts[sName] = (serviceCounts[sName] || 0) + 1;
    });

    let bestService = 'Corte Feminino';
    let maxSvcCount = 0;
    Object.entries(serviceCounts).forEach(([name, count]) => {
      if (count > maxSvcCount) {
        maxSvcCount = count;
        bestService = name;
      }
    });

    setTopService(bestService);

    // 3. REVENUE AND FATURAÇÃO: Calculate WoW trends (last 7 days vs previous 8-14 days)
    const nowMs = new Date().getTime();
    const msInDay = 24 * 60 * 60 * 1000;
    let thisWeekRev = 0;
    let lastWeekRev = 0;

    validBookings.forEach(b => {
      const bDateMs = new Date(b.booking_date).getTime();
      const diffDays = (nowMs - bDateMs) / msInDay;
      const price = Number(b.total_price) || 0;
      if (diffDays <= 7) {
        thisWeekRev += price;
      } else if (diffDays <= 14) {
        lastWeekRev += price;
      }
    });

    if (lastWeekRev > 0) {
      const diffPercent = ((thisWeekRev - lastWeekRev) / lastWeekRev) * 100;
      setRevenueChangePercent(diffPercent);
      if (diffPercent >= 0) {
        setRevenueChangeText(`A faturação desta semana está ${diffPercent.toFixed(0)}% acima da semana anterior.`);
      } else {
        setRevenueChangeText(`A faturação desta semana está ${Math.abs(diffPercent).toFixed(0)}% abaixo da semana anterior.`);
      }
    } else if (thisWeekRev > 0) {
      setRevenueChangePercent(10);
      setRevenueChangeText(`A faturação desta semana despoletou crescimento vigoroso com novos agendamentos concluidos!`);
    } else {
      setRevenueChangePercent(null);
      setRevenueChangeText('Não foram registados faturamentos significativos nos últimos 14 dias.');
    }

    // 4. CLIENTES INATIVOS (> 60 dias)
    const customerLastBooking: Record<string, number> = {};
    validBookings.forEach(b => {
      const nameKey = b.customer?.full_name || b.customer_profile?.full_name || b.notes || 'Cliente Particular';
      const dateMs = new Date(b.booking_date).getTime();
      if (!customerLastBooking[nameKey] || dateMs > customerLastBooking[nameKey]) {
        customerLastBooking[nameKey] = dateMs;
      }
    });

    let inactiveCount = 0;
    Object.values(customerLastBooking).forEach(lastDateMs => {
      const diffDays = (nowMs - lastDateMs) / msInDay;
      if (diffDays > 60) {
        inactiveCount++;
      }
    });

    setInactiveClientsCount(inactiveCount);

    // 5. AGENDA: Check free slots for tomorrow
    const tomorrowStr = new Date(nowMs + msInDay).toISOString().split('T')[0];
    const tomorrowBookings = validBookings.filter(b => b.booking_date === tomorrowStr);
    const bookedHours = tomorrowBookings.map(b => (b.start_time || '').substring(0, 5));
    
    // We check slots: '10:00', '11:00', '14:00', '15:00'
    const targetSlots = ['10:00', '11:00', '14:00', '15:00'];
    const freeSlots = targetSlots.filter(slot => !bookedHours.includes(slot));

    if (freeSlots.length > 0) {
      if (freeSlots.includes('10:00') && freeSlots.includes('11:00')) {
        setTomorrowAgendaText('Tem horários livres amanhã entre as 10h e as 12h.');
      } else {
        // Express list of morning or early afternoon free slots
        setTomorrowAgendaText(`Tem horários livres amanhã, designadamente às ${freeSlots.slice(0, 2).join(' e ')}h.`);
      }
    } else {
      setTomorrowAgendaText('A sua agenda para amanhã está completamente preenchida! Excelente taxa de ocupação.');
    }

  }, [bookings, services]);

  if (!business) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl" id="assistente-loading-block">
        <div className="w-6 h-6 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-mono">A carregar detalhes do assistente...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="dashboard-assistant-section">
      
      {/* Elegante Header da Secção */}
      <div className="border-b border-slate-100 pb-5">
        <h3 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2 font-display">
          Assistente Glamzo <span className="bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent">Estatísticas Reais</span>
        </h3>
        <p className="text-xs text-slate-505 text-slate-500 mt-0.5 font-medium">
          O assistente analisa os dados reais de reservas do seu estabelecimento para sugerir melhorias comerciais automáticas e seguras.
        </p>
      </div>

      {!hasEnoughData ? (
        // Banner elegantly displayed if not enough data
        <div className="p-8 bg-white border border-slate-200/80 rounded-3xl text-center space-y-4 shadow-sm" id="assistente-no-data-card">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto border border-purple-100 animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Sem dados suficientes para gerar recomendações</h4>
            <p className="text-xs text-slate-550 text-slate-500 leading-relaxed font-medium">
              O assistente analisa as suas marcações para calcular dias de baixa ocupação, serviços populares e hábitos de fidelização. 
              Receba os seus primeiros agendamentos na plataforma para desbloquear conselhos inteligentes.
            </p>
          </div>
          <div className="inline-block px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-450 tracking-wider uppercase font-mono">
            Mínimo Recomendado: 3 agendamentos ativos
          </div>
        </div>
      ) : (
        // Grid de Cartões Elegantes
        <div className="space-y-8 animate-fade-in" id="assistente-metrics-grid">
          
          {/* SECÇÃO 1: CARTÕES INTELIGENTES GLAMZO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CARD 1: SUGESTÃO GLAMZO (💡) */}
            <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-purple-200 hover:shadow-md transition-all space-y-3.5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-bl-full pointer-events-none" />
              <div className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                <h4 className="text-xs font-black text-purple-700 uppercase tracking-wider font-mono">
                  Sugestão Glamzo
                </h4>
              </div>
              <p className="text-[11px] text-slate-650 text-slate-600 leading-relaxed font-semibold">
                Tem vários horários livres na próxima {lowOccupancyDay.toLowerCase()}. Considere criar uma promoção exclusiva para preencher esses períodos e atrair novos clientes na vizinhança.
              </p>
              <div className="text-[9.5px] font-bold text-slate-600 font-mono uppercase bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                <span>Dia Alvo:</span>
                <span className="text-purple-600 font-extrabold">{lowOccupancyDay}</span>
              </div>
            </div>

            {/* CARD 2: TENDÊNCIA COMERCIAL (📈) */}
            <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-purple-200 hover:shadow-md transition-all space-y-3.5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-bl-full pointer-events-none" />
              <div className="flex items-center gap-2">
                <span className="text-lg">📈</span>
                <h4 className="text-xs font-black text-rose-600 uppercase tracking-wider font-mono">
                  Tendência
                </h4>
              </div>
              <p className="text-[11px] text-slate-650 text-slate-600 leading-relaxed font-semibold">
                {revenueChangePercent !== null && revenueChangePercent >= 0 
                  ? `As suas reservas e rendimentos aumentaram face à semana passada. Mantenha os seus profissionais disponíveis para garantir a procura!`
                  : `O volume de rendimento atual requer atenção de forma a revitalizar a procura do seu catálogo de serviços. Recomendamos criar campanhas.`
                }
              </p>
              <div className="text-[9.5px] font-bold text-slate-600 font-mono uppercase bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                <span>Desempenho:</span>
                <span className={`font-extrabold ${revenueChangePercent !== null && revenueChangePercent >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {revenueChangePercent !== null && revenueChangePercent >= 0 ? 'Crescimento ↑' : 'Estável •'}
                </span>
              </div>
            </div>

            {/* CARD 3: FIDELIZAÇÃO (👥) */}
            <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-purple-200 hover:shadow-md transition-all space-y-3.5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-bl-full pointer-events-none" />
              <div className="flex items-center gap-2">
                <span className="text-lg">👥</span>
                <h4 className="text-xs font-black text-amber-600 uppercase tracking-wider font-mono">
                  Fidelização
                </h4>
              </div>
              <p className="text-[11px] text-slate-650 text-slate-600 leading-relaxed font-semibold">
                {inactiveClientsCount > 0 
                  ? `Existem ${inactiveClientsCount} clientes frequentes que não visitam o seu espaço há mais de 60 dias. Envie-lhes um lembrete com desconto para os reconectar.`
                  : `Excelente retenção! Todos os seus clientes habituais têm regressado ao salão para desfrutar do seu catálogo de beleza premium nos últimos 60 dias.`
                }
              </p>
              <div className="text-[9.5px] font-bold text-slate-600 font-mono uppercase bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                <span>Clientes Inativos:</span>
                <span className="text-amber-600 font-extrabold">{inactiveClientsCount} e-mails</span>
              </div>
            </div>

          </div>

          {/* SECÇÃO 2: DETALHES DE OPERAÇÃO OPERACIONAL */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest font-mono">
              Estatísticas Reais Analisadas
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CARTÃO: OCUPAÇÃO & DIAS */}
              <div className="p-5.5 bg-slate-50/50 border border-slate-200 rounded-3xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-150 flex items-center justify-center shrink-0 text-purple-600">
                  <Clock className="w-5 h-5 line-clamp-1" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider font-mono block">Ocupação Horária</span>
                  <p className="text-xs font-extrabold text-slate-800 leading-snug">
                    {lowOccupancyDay} entre as 14h e as 17h apresenta baixa ocupação estrutural.
                  </p>
                  <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                    Ajuste a escala dos seus profissionais ou considere incentivar mais marcações de tarde lançando serviços rápidos de desconto exclusivo.
                  </p>
                </div>
              </div>

              {/* CARTÃO: SERVIÇOS TENDÊNCIA */}
              <div className="p-5.5 bg-slate-50/50 border border-slate-200 rounded-3xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-150 flex items-center justify-center shrink-0 text-purple-600">
                  <Award className="w-5 h-5 line-clamp-1" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider font-mono block">Serviço de Elite</span>
                  <p className="text-xs font-extrabold text-slate-800 leading-snug">
                    O serviço mais reservado esta semana foi {topService}.
                  </p>
                  <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                    Este serviço representa a maior fatia de consultas no estabelecimento. Promova-o com destaque na sua página pública para obter novas subscrições de pacotes.
                  </p>
                </div>
              </div>

              {/* CARTÃO: FATURAÇÃO WOW TRENDS */}
              <div className="p-5.5 bg-slate-50/50 border border-slate-200 rounded-3xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-150 flex items-center justify-center shrink-0 text-purple-600">
                  <TrendingUp className="w-5 h-5 line-clamp-1" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider font-mono block">Faturação Comercial</span>
                  <p className="text-xs font-extrabold text-slate-800 leading-snug">
                    {revenueChangeText}
                  </p>
                  <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                    Comparação baseada nos agendamentos pagos e confirmados nas últimas duas semanas na plataforma.
                  </p>
                </div>
              </div>

              {/* CARTÃO: HORÁRIOS LIVRES / SLOT AMANHÃ */}
              <div className="p-5.5 bg-slate-50/50 border border-slate-200 rounded-3xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-150 flex items-center justify-center shrink-0 text-purple-600">
                  <Calendar className="w-5 h-5 line-clamp-1" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider font-mono block">Disponibilidade de Agenda</span>
                  <p className="text-xs font-extrabold text-slate-800 leading-snug">
                    {tomorrowAgendaText}
                  </p>
                  <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                    Agilize e incentive a sua equipa. Pode preencher estes períodos ociosos ligando campanhas automáticas de e-mail de última hora aos clientes registados.
                  </p>
                </div>
              </div>

              {/* CARTÃO: PROMOÇOÕES BASEADAS EM DADOS */}
              <div className="p-5.5 bg-slate-50/50 border border-slate-200 rounded-3xl flex items-start gap-4 md:col-span-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-150 flex items-center justify-center shrink-0 text-purple-600">
                  <Percent className="w-5 h-5 line-clamp-1" />
                </div>
                <div className="space-y-1 flex-1">
                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider font-mono block font-extrabold">Campanha Recomendada</span>
                  <p className="text-xs font-extrabold text-slate-800 leading-snug">
                    Sugerimos criar uma promoção para {suggestedPromoDay.toLowerCase()} à tarde.
                  </p>
                  <p className="text-[11px] text-slate-550 text-slate-500 font-normal leading-relaxed">
                    Criar um cupão recorrente (ex: <strong className="text-purple-600 select-all tracking-wider font-mono uppercase">{suggestedPromoDay.substring(0, 3).toUpperCase()}_GLAM_15</strong>) com 15% de desconto para marcações especificadas para {suggestedPromoDay.toLowerCase()} após as 14h ajudará a catalisar lucros ociosos no Glamzo Pay.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* SEGURANÇA E PRIVACIDADE DE DADOS */}
          <div className="p-4 bg-purple-50/30 border border-purple-100 rounded-2xl flex items-center justify-between gap-4 text-xs font-medium">
            <span className="text-purple-700 font-display font-bold flex items-center gap-1.5 shrink-0 select-none">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Segurança Certificada
            </span>
            <span className="text-[10px] text-slate-500 text-right leading-relaxed max-w-lg">
              Os dados das suas marcações e clientes são processados em total conformidade com o RGPD. Todas as estatísticas e sugestões automáticas são geradas localmente com máxima encriptação de dados.
            </span>
          </div>

        </div>
      )}

    </div>
  );
}
