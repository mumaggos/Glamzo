import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  X, Calendar, Clock, User, CreditCard, Check, 
  ChevronRight, ArrowLeft, Loader2, Sparkles, Smile, ShieldCheck, AlertCircle 
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: any;
  services: any[];
  user: any;
  profile: any;
  initialSelectedService?: any;
}

export default function BookingModal({
  isOpen,
  onClose,
  business,
  services,
  user,
  profile,
  initialSelectedService
}: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<any | null>('any'); // 'any' or staff object
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'local' | 'stripe'>('local');
  const [notes, setNotes] = useState('');

  // Coupon and Loyalty points redemption states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [appliedReward, setAppliedReward] = useState<any | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const handleApplyCoupon = async () => {
    setCouponError(null);
    setCouponSuccess(null);
    const code = couponCode.trim().toUpperCase();
    if (!code || !selectedService) return;

    // Check system admin / default coupons
    if (code === 'BEMVINDO10') {
      const disc = Number((selectedService.price * 0.1).toFixed(2));
      setCouponDiscount(disc);
      setAppliedCoupon({ code, type: 'percent', val: 10 });
      setCouponSuccess(`Cupão BEMVINDO10 aplicado! Desconto de 10% (-${disc.toFixed(2)}€)`);
      setAppliedReward(null);
      return;
    }
    if (code === 'ESTETICA20') {
      const disc = Number((selectedService.price * 0.2).toFixed(2));
      setCouponDiscount(disc);
      setAppliedCoupon({ code, type: 'percent', val: 20 });
      setCouponSuccess(`Cupão ESTETICA20 aplicado! Desconto de 20% (-${disc.toFixed(2)}€)`);
      setAppliedReward(null);
      return;
    }
    if (code === 'GLAMZOLOCAL') {
      const disc = Math.min(5, selectedService.price);
      setCouponDiscount(disc);
      setAppliedCoupon({ code, type: 'flat', val: 5 });
      setCouponSuccess(`Cupão GLAMZOLOCAL de 5.00€ aplicado com sucesso!`);
      setAppliedReward(null);
      return;
    }

    // Check custom coupons inside local storage (created dynamically by admin)
    try {
      const localCoupons = JSON.parse(localStorage.getItem('glamzo_coupons') || '[]');
      const found = localCoupons.find((c: any) => c.code.toUpperCase() === code);
      if (found) {
        let disc = 0;
        if (found.discount_type === 'percent') {
          disc = Number((selectedService.price * (found.discount_value / 100)).toFixed(2));
        } else {
          disc = Math.min(found.discount_value, selectedService.price);
        }
        setCouponDiscount(disc);
        setAppliedCoupon({ code, ...found });
        setCouponSuccess(`Cupão ${code} aplicado com sucesso! Desconto de -${disc.toFixed(2)}€`);
        setAppliedReward(null);
        return;
      }
    } catch (_) {}

    // Check customer Reward Codes (Códigos Recompensa) from points exchange on Supabase
    try {
      if (user?.id) {
        const { data: foundReward, error } = await supabase
          .from('reward_coupons')
          .select('*')
          .eq('customer_id', user.id)
          .eq('code', code.trim().toUpperCase())
          .eq('used', false)
          .maybeSingle();

        if (!error && foundReward) {
          const value = Number(foundReward.value); // €5 or €10 discount
          const disc = Math.min(value, selectedService.price);
          setCouponDiscount(disc);
          setAppliedReward(foundReward);
          setCouponSuccess(`Código Recompensa ${code} correspondente a um desconto de ${value}€ aplicado!`);
          setAppliedCoupon(null);
          return;
        }
      }
    } catch (_) {}

    setCouponError('Cupão ou Código Recompensa inválido ou expirado.');
  };

  // Fetching state / cache data
  const [staff, setStaff] = useState<any[]>([]);
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const [businessSubscription, setBusinessSubscription] = useState<any | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<any | null>(null);

  // Credit Card mock inputs for Stripe payment option
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');

  // Set initial selected service if supplied
  useEffect(() => {
    if (initialSelectedService) {
      setSelectedService(initialSelectedService);
      setStep(2); // Jump straight to choosing staff
    } else {
      setSelectedService(null);
      setStep(1);
    }
  }, [initialSelectedService, isOpen]);

  // Load all required scheduling context from database
  useEffect(() => {
    const loadBookingContext = async () => {
      if (!business?.id || !isOpen) return;
      setLoadingMetadata(true);
      setErrorMsg(null);
      try {
        // 1. Fetch active staff
        const { data: staffData, error: staffErr } = await supabase
          .from('staff')
          .select('*')
          .eq('business_id', business.id)
          .eq('is_active', true);
        if (staffErr) throw staffErr;
        setStaff(staffData || []);

        // 2. Fetch business hours
        const { data: hoursData, error: hoursErr } = await supabase
          .from('business_hours')
          .select('*')
          .eq('business_id', business.id);
        if (hoursErr) throw hoursErr;
        setBusinessHours(hoursData || []);

        // 3. Fetch bookings for this store (excluding cancelled ones)
        const { data: bookingsData, error: bookingsErr } = await supabase
          .from('bookings')
          .select('id, staff_id, booking_date, start_time, end_time, booking_status')
          .eq('business_id', business.id)
          .neq('booking_status', 'cancelled');
        if (bookingsErr) throw bookingsErr;
        setExistingBookings(bookingsData || []);

        // 4. Fetch subscription details to inspect PRO/Default tier comission settings
        try {
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('business_id', business.id)
            .eq('status', 'active')
            .maybeSingle();
          setBusinessSubscription(subData || null);
        } catch (subErr) {
          console.warn('Subscription table read warning: default commission of 15% will be applied.', subErr);
        }
      } catch (err: any) {
        console.error('Error loading booking data context:', err);
        setErrorMsg('Erro ao comunicar com a base de dados. Verifique a sua conexão.');
      } finally {
        setLoadingMetadata(false);
      }
    };

    loadBookingContext();
  }, [business?.id, isOpen]);

  if (!isOpen) return null;

  // Next 30 days calendar generator
  const daysToShow = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const getWeekdayName = (date: Date) => {
    const weekdays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    return weekdays[date.getDay()];
  };

  const getMonthName = (date: Date) => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months[date.getMonth()];
  };

  // Convert "HH:MM" string to minutes
  const timeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Convert minutes to "HH:MM" time string
  const minutesToTime = (mins: number): string => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Slots availability calculation engine
  const getAvailableSlots = () => {
    if (!selectedDate || !selectedService) return [];

    const weekday = selectedDate.getDay();
    const dayHours = businessHours.find(h => h.weekday === weekday);
    
    // If closed or hours row doesn't exist, zero slots
    if (!dayHours || dayHours.is_closed) {
      return [];
    }

    const openTime = dayHours.open_time || '09:00';
    const closeTime = dayHours.close_time || '18:00';

    const startMin = timeToMinutes(openTime);
    const endMin = timeToMinutes(closeTime);
    const duration = selectedService.duration_minutes || 30;

    const dateStr = selectedDate.toISOString().split('T')[0];
    const bookingsToday = existingBookings.filter(b => b.booking_date === dateStr);

    const isToday = dateStr === new Date().toISOString().split('T')[0];
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const slots: { start: string; end: string; assignedStaffId: string | null }[] = [];
    const stepInterval = 30; // 30-minute intervals

    for (let slotStart = startMin; slotStart <= endMin - duration; slotStart += stepInterval) {
      const slotEnd = slotStart + duration;

      // Filter slots starting in the past if selected day is today
      if (isToday && slotStart <= nowMinutes + 15) {
        continue;
      }

      const slotStartStr = minutesToTime(slotStart);
      const slotEndStr = minutesToTime(slotEnd);

      let isAvailable = false;
      let assignedStaffId: string | null = null;

      if (selectedStaff === 'any') {
        if (staff.length === 0) {
          // If no staff members exist: check overall overlapping bookings
          const hasOverlap = bookingsToday.some(b => {
            const bStart = timeToMinutes(b.start_time);
            const bEnd = timeToMinutes(b.end_time);
            return slotStart < bEnd && bStart < slotEnd;
          });
          if (!hasOverlap) {
            isAvailable = true;
          }
        } else {
          // Check if there is at least one active staff member who has no overlap AND is not on an off-day (folga)
          const availableStaff = staff.filter(s => {
            // Check off-days (folgas)
            if (s.off_days) {
              const offDaysArr = s.off_days.split(',').map(item => Number(item.trim()));
              if (offDaysArr.includes(weekday)) {
                return false; // Active professional is on holiday/rest day
              }
            }
            const pathOverlap = bookingsToday.some(b => {
              if (b.staff_id !== s.id) return false;
              const bStart = timeToMinutes(b.start_time);
              const bEnd = timeToMinutes(b.end_time);
              return slotStart < bEnd && bStart < slotEnd;
            });
            return !pathOverlap;
          });

          if (availableStaff.length > 0) {
            isAvailable = true;
            assignedStaffId = availableStaff[0].id; // Assign first available load
          }
        }
      } else {
        // Specific staff selected - check if they are on an off-day (folga)
        let isStaffOnOffDay = false;
        if (selectedStaff.off_days) {
          const offDaysArr = selectedStaff.off_days.split(',').map(item => Number(item.trim()));
          if (offDaysArr.includes(weekday)) {
            isStaffOnOffDay = true;
          }
        }

        if (!isStaffOnOffDay) {
          const hasOverlap = bookingsToday.some(b => {
            if (b.staff_id !== selectedStaff.id) return false;
            const bStart = timeToMinutes(b.start_time);
            const bEnd = timeToMinutes(b.end_time);
            return slotStart < bEnd && bStart < slotEnd;
          });

          if (!hasOverlap) {
            isAvailable = true;
            assignedStaffId = selectedStaff.id;
          }
        }
      }

      if (isAvailable) {
        slots.push({
          start: slotStartStr,
          end: slotEndStr,
          assignedStaffId
        });
      }
    }

    return slots;
  };

  const availableSlots = getAvailableSlots();

  // Create real booking in database
  const handleConfirmReservation = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Double check actual availability right before inserting (Anti-Conflict Protection)
      const currentAvailable = getAvailableSlots();
      const matchedSlot = currentAvailable.find(s => s.start === selectedTime);
      
      if (!matchedSlot) {
        throw new Error('Alerta anti-conflito: Este horário foi reservado por outro utilizador neste exato momento. Por favor escolha outra hora.');
      }

      const finalStaffId = selectedStaff === 'any' ? matchedSlot.assignedStaffId : selectedStaff.id;
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // Calculate end time string from selected time and duration
      const startMin = timeToMinutes(selectedTime);
      const endMin = startMin + selectedService.duration_minutes;
      const endTimeStr = minutesToTime(endMin);

      const initialBookingStatus = paymentMethod === 'local' ? 'confirmed' : 'pending';
      const initialPaymentStatus = 'unpaid';

      // 2. Perform Insert in real public.bookings table combining FASE 10 financial rules
      const isPro = businessSubscription?.plan_name === 'PRO';
      const feeRate = isPro ? 0.05 : 0.15;
      
      const basePrice = Number(selectedService.price);
      const discount = Number(couponDiscount || 0);
      const stripeTax = paymentMethod === 'stripe' ? 1.50 : 0.00; // Taxas
      
      const finalPriceToPay = Math.max(0, Number((basePrice + stripeTax - discount).toFixed(2)));
      
      // Calculate original commission and protect partner business earnings (Rule #4)
      const originalCommission = paymentMethod === 'stripe' ? Number((basePrice * feeRate).toFixed(2)) : 0;
      const businessAmount = paymentMethod === 'stripe' ? Number((basePrice - originalCommission).toFixed(2)) : finalPriceToPay; // Store receives full base rate minus commission for stripe, or 100% of final price for local cash!
      const glamzoFee = paymentMethod === 'stripe' ? Number((finalPriceToPay - businessAmount).toFixed(2)) : 0; // Glamzo absorbs the discount, resulting in a reduced/negative net fee representing the discount coverage on online, local is 0 fee!

      // Initially set booking's payment_status to 'unpaid'
      const { data, error } = await supabase
         .from('bookings')
         .insert({
           customer_id: user.id,
           business_id: business.id,
           service_id: selectedService.id,
           staff_id: finalStaffId,
           booking_date: dateStr,
           start_time: selectedTime,
           end_time: endTimeStr,
           total_price: finalPriceToPay, // actual paid price
           payment_method: paymentMethod,
           payment_status: initialPaymentStatus,
           booking_status: initialBookingStatus,
           notes: notes.trim() || null
         })
         .select(`
           *,
           service:services(name, price, duration_minutes),
           staff:staff(full_name)
         `)
         .single();

      if (error) throw error;

      // 3. Create real public.payments record
      const { error: paymentErr } = await supabase
        .from('payments')
        .insert({
          booking_id: data.id,
          customer_id: user.id,
          business_id: business.id,
          amount_total: finalPriceToPay,
          glamzo_fee: glamzoFee,
          business_amount: businessAmount,
          payment_method: paymentMethod,
          payment_status: initialPaymentStatus,
          stripe_payment_intent: null
        });

      if (paymentErr) {
        console.warn('Payments record insert failed, checking table existence:', paymentErr.message);
      }

      // Mark single-use reward code as used in Supabase
      if (appliedReward) {
        try {
          await supabase
            .from('reward_coupons')
            .update({ used: true, used_at: new Date().toISOString() })
            .eq('id', appliedReward.id);
        } catch (_) {}
      }

      // 4. Handle Stripe Redirection
      if (paymentMethod === 'stripe') {
        try {
          const res = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: data.id,
              amount: finalPriceToPay,
              customerEmail: user.email,
              businessName: business.name,
              serviceName: selectedService.name,
              stripeAccountId: business.stripe_account_id,
              successUrl: `${window.location.origin}/account?status=success&booking_id=${data.id}`,
              cancelUrl: `${window.location.origin}/account?status=cancelled`
            })
          });

          if (!res.ok) {
            throw new Error('Falha na resposta do servidor');
          }

          const checkoutData = await res.json();
          if (checkoutData?.url) {
            // Real Redirect to Stripe Checkout (breakout of standard iframe sandbox if necessary)
            if (checkoutData.url.startsWith('http') || window.self !== window.top) {
              window.open(checkoutData.url, '_blank');
            } else {
              window.location.href = checkoutData.url;
            }
            return;
          } else {
            throw new Error('Nenhum link de checkout foi retornado');
          }
        } catch (stripeErr) {
          console.error('Stripe redirect exception:', stripeErr);
          throw new Error('Serviço Stripe indisponível no momento. Por favor tente agendar selecionando "Pagar diretamente no local".');
        }
      }

      setSuccessBooking(data);
    } catch (err: any) {
      console.error('Reservation booking creation failure:', err);
      setErrorMsg(err.message || 'Falha ao processar o seu agendamento no servidor. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentStepTitle = () => {
    switch(step) {
      case 1: return 'Selecionar Serviço';
      case 2: return 'Selecionar Profissional';
      case 3: return 'Data de Atendimento';
      case 4: return 'Horários Disponíveis';
      case 5: return 'Método de Pagamento';
      case 6: return 'Confirmar Agendamento';
      default: return 'Fazer Reserva';
    }
  };

  return (
    <div id="booking-modal-backdrop" className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div id="booking-modal-card" className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div>
            <span className="text-[10px] bg-rose-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono font-bold font-extrabold select-none">
              Sessão: {profile?.full_name || user?.email.split('@')[0]}
            </span>
            <h3 className="text-base font-black tracking-tight mt-1">{currentStepTitle()}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading overlay for metadata */}
        {loadingMetadata && (
          <div className="flex-1 py-16 flex flex-col items-center justify-center gap-3 bg-white">
            <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
            <span className="text-xs text-slate-400 font-mono">Consultando base de dados da loja...</span>
          </div>
        )}

        {/* Success screen overlay */}
        {!loadingMetadata && successBooking && (
          <div className="flex-1 overflow-y-auto p-8 text-center space-y-6 bg-white flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-2 border border-emerald-100 shadow-sm">
              <ShieldCheck className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-xl font-black text-slate-800">Marcação Efetuada com Sucesso Real!</h4>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Agendamento inserido com sucesso na base de dados e horário bloqueado para prevenir conflitos na agenda do estúdio <strong>{business.name}</strong>.
              </p>
            </div>

            {/* Receipt Summary card */}
            <div className="w-full max-w-sm bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left text-xs space-y-2.5 font-sans">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Serviço</span>
                <span className="text-slate-800 font-bold">{successBooking.service?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Profissional</span>
                <span className="text-slate-800 font-semibold">{successBooking.staff?.full_name || 'Qualquer Profissional'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Data da Visita</span>
                <span className="text-slate-800 font-mono font-bold">
                  {new Date(successBooking.booking_date).toLocaleDateString('pt', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Horário</span>
                <span className="text-rose-600 font-mono font-bold">{successBooking.start_time} - {successBooking.end_time}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-2 shadow-2xs">
                <span className="text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">Valor pago/a acordar</span>
                <span className="text-slate-850 font-mono font-black text-sm">{Number(successBooking.total_price).toFixed(2)} €</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <a 
                href="/account" 
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs text-center transition-all cursor-pointer block"
              >
                Minha Conta / Reservas
              </a>
              <button 
                onClick={onClose} 
                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs text-center transition-all cursor-pointer"
              >
                Voltar à Glamzo
              </button>
            </div>
          </div>
        )}

        {/* Step Core Views */}
        {!loadingMetadata && !successBooking && (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Alert error panel inside modal */}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-start gap-2 leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Progress Steps Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
                <span className="text-xs text-slate-400 font-bold font-mono">Fase {step} de 6</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6].map(s => (
                    <div 
                      key={s} 
                      className={`h-1.5 rounded-full transition-all ${
                        s === step ? 'w-6 bg-rose-600' : s < step ? 'w-2 bg-slate-700' : 'w-2 bg-slate-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* STEP 1: SERVICE SELECTION */}
              {step === 1 && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">Menu de Serviços do Estabelecimento</p>
                  <div className="grid grid-cols-1 gap-3">
                    {services.map(srv => {
                      const isSelected = selectedService?.id === srv.id;
                      return (
                        <div 
                          key={srv.id}
                          onClick={() => {
                            setSelectedService(srv);
                            setSelectedDate(null);
                            setSelectedTime(null);
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 justify-between items-center ${
                            isSelected 
                              ? 'border-rose-500 bg-rose-50/40 text-rose-950 font-semibold ring-2 ring-rose-500/10' 
                              : 'border-slate-100 hover:bg-slate-50 text-slate-700 bg-slate-50/20'
                          }`}
                        >
                          <div className="flex gap-3.5 items-start">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-150 shrink-0">
                              <img 
                                src={srv.image_url || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=120&q=70'} 
                                alt="Service logo" 
                                loading="lazy"
                                decoding="async"
                                width="48"
                                height="48"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-800">{srv.name}</h4>
                              <p className="text-[10px] text-slate-400 leading-normal max-w-sm line-clamp-2 mt-0.5">{srv.description || 'Tratamento premium de assinatura'}</p>
                              <span className="text-[10px] font-mono text-slate-400 block mt-1">⏱ {srv.duration_minutes} minutos de duração</span>
                            </div>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <span className="text-sm font-black text-rose-700 font-mono block">{Number(srv.price).toFixed(2)} €</span>
                            {isSelected && (
                              <span className="inline-flex items-center gap-0.5 mt-1 text-[9px] font-bold text-rose-600 font-mono bg-rose-100/50 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3 text-rose-600" /> selecionado
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: STAFF SELECTION */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">Selecione o seu Profissional</p>
                  
                  {/* Any Staff option */}
                  <div 
                    onClick={() => {
                      setSelectedStaff('any');
                      setSelectedTime(null);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-3.5 items-center ${
                      selectedStaff === 'any'
                        ? 'border-rose-500 bg-rose-50/40 text-rose-950 font-semibold ring-2 ring-rose-500/10'
                        : 'border-slate-100 hover:bg-slate-50 bg-slate-50/20'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-650 flex items-center justify-center font-bold tracking-wide border border-slate-300 shadow-xs shrink-0 text-xs">
                      <Smile className="w-6 h-6 text-slate-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">Qualquer profissional disponível</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Selecione esta opção para obter a máxima disponibilidade de agendas vazias.</p>
                    </div>
                  </div>

                  {/* Staff List */}
                  {staff.length === 0 ? (
                    <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl inline-block mt-2">Nenhum profissional cadastrado. A reserva usará a agenda geral.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2.5">
                      {staff.map(s => {
                        const isSelected = selectedStaff !== 'any' && selectedStaff.id === s.id;
                        return (
                          <div 
                            key={s.id}
                            onClick={() => {
                              setSelectedStaff(s);
                              setSelectedTime(null);
                            }}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 items-center ${
                              isSelected
                                ? 'border-rose-500 bg-rose-50/40 text-rose-950 font-semibold ring-2 ring-rose-500/10'
                                : 'border-slate-100 hover:bg-slate-50 bg-slate-50/20'
                            }`}
                          >
                            <img 
                              src={s.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=70'} 
                              alt={s.full_name} 
                              loading="lazy"
                              decoding="async"
                              width="44"
                              height="44"
                              className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-100"
                            />
                            <div>
                              <h4 className="text-xs font-black text-slate-850">{s.full_name}</h4>
                              <p className="text-[10px] text-slate-400">{s.role_title || 'Estilista de Beleza'}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: DATE SELECTION */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">Selecione o Dia para Visita</p>
                    <p className="text-[10px] text-slate-400">Pode antecipar o agendamento até um prazo de look-ahead de 30 dias na base de dados.</p>
                  </div>

                  {/* Horizontally scrolling Dates list */}
                  <div className="flex gap-2.5 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin select-none">
                    {daysToShow.map((date, idx) => {
                      const isSelected = selectedDate ? selectedDate.toISOString().split('T')[0] === date.toISOString().split('T')[0] : false;
                      const weekday = date.getDay();
                      const hoursRow = businessHours.find(h => h.weekday === weekday);
                      const isClosed = !hoursRow || hoursRow.is_closed;

                      return (
                        <div 
                          key={idx}
                          onClick={() => {
                            if (!isClosed) {
                              setSelectedDate(date);
                              setSelectedTime(null);
                            }
                          }}
                          className={`snap-center shrink-0 w-[72px] rounded-2xl py-3 border text-center transition-all ${
                            isClosed 
                              ? 'border-slate-100 bg-slate-50/40 text-slate-350 cursor-not-allowed' 
                              : isSelected
                                ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold ring-2 ring-rose-500/10 cursor-pointer'
                                : 'border-slate-200 hover:border-slate-350 bg-white text-slate-700 cursor-pointer shadow-xs'
                          }`}
                        >
                          <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{getWeekdayName(date)}</span>
                          <span className="block text-lg font-black font-mono leading-none my-1">{date.getDate()}</span>
                          <span className="block text-[10px] text-slate-500">{getMonthName(date)}</span>
                          
                          {isClosed && (
                            <span className="block text-[8px] font-bold text-slate-400 mt-1">FECHADO</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: TIME SLOTS */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">Escolha um Horário Disponível</p>
                    {selectedDate && (
                      <p className="text-[11px] text-slate-500 font-semibold font-mono">
                        🗓 {selectedDate.toLocaleDateString('pt', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>

                  {availableSlots.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                      <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                      <h5 className="text-xs font-bold text-slate-700">Agenda Ocupada ou Indisponível</h5>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        Todos os horários programados já foram totalmente preenchidos por outros agendamentos ou o salão encontra-se indisponível nesta data. Selecione uma data alternativa!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                      {availableSlots.map(slot => {
                        const isSelected = selectedTime === slot.start;
                        return (
                          <div 
                            key={slot.start}
                            onClick={() => setSelectedTime(slot.start)}
                            className={`p-2.5 rounded-xl border text-center cursor-pointer font-mono font-bold transition-all text-xs ${
                              isSelected
                                ? 'border-rose-600 bg-rose-600 text-white shadow-md'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-700 bg-white shadow-2xs'
                            }`}
                          >
                            <span>{slot.start}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: PAYMENT ENGINE METHOD */}
              {step === 5 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">Método para Resgate e Pagamento</p>
                  
                  <div className="grid grid-cols-1 gap-3">
                    
                    {/* Pay at Salon (Local) */}
                    <div 
                      onClick={() => setPaymentMethod('local')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                        paymentMethod === 'local'
                          ? 'border-rose-500 bg-rose-50/40 text-rose-950 font-semibold ring-2 ring-rose-500/10'
                          : 'border-slate-100 hover:bg-slate-50 bg-slate-50/20'
                      }`}
                    >
                      <div className="flex gap-3.5 items-center">
                        <div className="p-2.5 bg-slate-100 text-slate-650 rounded-xl">
                          <Smile className="w-5 h-5 text-slate-700" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800">Pagar diretamente no Local</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Dinheiro, cartões multibanco/crédito ou MBWay na recepção do salão.</p>
                        </div>
                      </div>
                      <div className="shrink-0 h-5 w-5 rounded-full border border-slate-300 flex items-center justify-center">
                        {paymentMethod === 'local' && <div className="h-3 w-3 rounded-full bg-rose-600" />}
                      </div>
                    </div>

                    {/* Pay with Stripe REAL */}
                    <div 
                      onClick={() => setPaymentMethod('stripe')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-4 ${
                        paymentMethod === 'stripe'
                          ? 'border-rose-500 bg-rose-50/40 text-rose-950 font-semibold ring-2 ring-rose-500/10'
                          : 'border-slate-100 hover:bg-slate-50 bg-slate-50/20'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex gap-3.5 items-center">
                          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-800">Pagar Online Seguro (Stripe / Cartão)</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {!business?.charges_enabled || !business?.payouts_enabled 
                                ? 'Pagamento online de teste/plataforma ativo para verificação rápida.'
                                : 'Pagamento online imediato e seguro processado pela Stripe.'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="shrink-0 h-5 w-5 rounded-full border border-slate-300 flex items-center justify-center">
                          {paymentMethod === 'stripe' && <div className="h-3 w-3 rounded-full bg-rose-600" />}
                        </div>
                      </div>

                      {paymentMethod === 'stripe' && (
                        <div className="p-3 bg-white/70 backdrop-blur-xs border border-rose-100 rounded-xl space-y-2 mt-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Stripe Checkout Ativo</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-normal">
                            Será redirecionado de forma 100% segura para efetuar o pagamento. São suportados cartões, <strong>MBWay</strong>, <strong>Apple Pay</strong> e <strong>Google Pay</strong>.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 6: CONFIRM RESERVATION AND NOTES */}
              {step === 6 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">Reveja as Informações da Marcação</p>
                  
                  {/* Detailed receipt container */}
                  <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-2xs">
                    
                    {/* Salon header in card */}
                    <div className="bg-slate-900 text-white p-4 flex gap-3 items-center">
                      <img 
                        src={business.logo_url || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=100&q=70'} 
                        alt="Logo" 
                        loading="lazy"
                        decoding="async"
                        width="32"
                        height="32"
                        className="w-8 h-8 rounded-lg object-cover bg-white"
                      />
                      <div>
                        <h4 className="text-xs font-black">{business.name}</h4>
                        <p className="text-[10px] text-slate-350">{business.address}, {business.city}</p>
                      </div>
                    </div>

                    {/* Line Items */}
                    <div className="p-4 bg-slate-50/50 space-y-3 text-xs leading-relaxed text-slate-750">
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Serviço de Beleza</span>
                        <div className="text-right">
                          <span className="font-extrabold text-slate-800 block text-xs">{selectedService.name}</span>
                          <span className="text-[10px] text-slate-400">⏱ {selectedService.duration_minutes} min de duração</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Profissional Associado</span>
                        <span className="font-bold text-slate-800">
                          {selectedStaff === 'any' ? 'Qualquer profissional disponível (Auto-atribuição)' : selectedStaff.full_name}
                        </span>
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Data da Marcação</span>
                        <span className="font-bold text-slate-800 font-sans">
                          {selectedDate?.toLocaleDateString('pt', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Horário</span>
                        <span className="font-bold font-mono text-rose-600 border border-thin px-2 py-0.5 rounded-md bg-rose-50 text-xs">
                          {selectedTime} h
                        </span>
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Forma de Pagamento</span>
                        <span className="font-bold text-slate-800 bg-slate-100/60 px-2 py-0.5 rounded text-[11px]">
                          {paymentMethod === 'stripe' ? '💳 Cartão de Crédito (Stripe)' : '💸 Pagar no Estabelecimento'}
                        </span>
                      </div>

                      {/* Detailed billing breakdown with real numbers */}
                      <div className="border-t border-slate-150 pt-2.5 space-y-1 text-xs">
                        <div className="flex justify-between items-center text-slate-500">
                          <span>Preço Base do Serviço</span>
                          <span className="font-mono">{Number(selectedService.price).toFixed(2)} €</span>
                        </div>
                        {paymentMethod === 'stripe' && (
                          <div className="flex justify-between items-center text-slate-500">
                            <span>Taxa de Processamento Online</span>
                            <span className="font-mono">+1.50 €</span>
                          </div>
                        )}
                        {couponDiscount > 0 && (
                          <div className="flex justify-between items-center text-emerald-600 font-bold">
                            <span>Desconto Aplicado</span>
                            <span className="font-mono">-{couponDiscount.toFixed(2)} €</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-150 pt-3">
                        <span className="text-slate-500 font-black uppercase text-[10px]">Preço Total a Pagar</span>
                        <span className="text-base font-black text-rose-700 font-mono">
                          {Math.max(0, Number(selectedService.price) + (paymentMethod === 'stripe' ? 1.50 : 0.00) - couponDiscount).toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Codes Input Block */}
                  <div className="bg-slate-50 border border-slate-205/60 p-4 rounded-2xl space-y-2 text-left">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Possui algum Código Promocional ou de Fidelização?
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                        placeholder="Ex: BEMVINDO10 ou RECOMPENSA-..."
                        className="flex-grow bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-rose-500 uppercase"
                      />
                      <button 
                        type="button"
                        onClick={handleApplyCoupon}
                        className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-855 cursor-pointer"
                      >
                        Validar
                      </button>
                    </div>
                    {couponError && <p className="text-[11px] text-rose-600 font-semibold">{couponError}</p>}
                    {couponSuccess && <p className="text-[11px] text-emerald-600 font-bold">{couponSuccess}</p>}
                  </div>

                  {/* Customer personal notes textarea */}
                  <div className="space-y-1.5 pt-2">
                    <label htmlFor="notes-textarea" className="block text-xs font-bold text-slate-550 uppercase tracking-wider">
                      Adicionar Observações (Opcional)
                    </label>
                    <textarea 
                      id="notes-textarea" 
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      maxLength={180}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white leading-relaxed focus:ring-rose-500 placeholder-slate-300 text-slate-700"
                      rows={2}
                      placeholder="e.g. Tenho cabelo delicado / preciso de acabar mais cedo / observações adicionais..."
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Sticky Actions Footer */}
            <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 flex justify-between items-center gap-3 shrink-0">
              
              {/* Back controls */}
              {step > 1 ? (
                <button 
                  onClick={() => {
                    // If service was pre-selected, let back skip Step 1 and go straight back to detail page!
                    if (step === 2 && initialSelectedService) {
                      onClose();
                    } else {
                      setStep(step - 1);
                    }
                  }}
                  className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>
              ) : (
                <button 
                  onClick={onClose}
                  className="px-5 py-2.5 bg-white border border-slate-205 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              )}

              {/* Forward controls / Submit confirmation */}
              {step < 6 ? (
                <button 
                  onClick={() => {
                    if (step === 1 && !selectedService) {
                      setErrorMsg('Selecione um serviço de atendimento primeiro.');
                      return;
                    }
                    if (step === 2 && !selectedStaff) {
                      setErrorMsg('Selecione um profissional profissional da nossa equipe ou avance com "Qualquer profissional".');
                      return;
                    }
                    if (step === 3 && !selectedDate) {
                      setErrorMsg('Por favor defina o dia do seu atendimento no calendário em carrossel.');
                      return;
                    }
                    if (step === 4 && !selectedTime) {
                      setErrorMsg('Por favor selecione um horário vago na nossa marcação.');
                      return;
                    }
                    setErrorMsg(null);
                    setStep(step + 1);
                  }}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Seguinte</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={handleConfirmReservation}
                  disabled={submitting}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs tracking-wide transition-all flex items-center gap-1.5 cursor-pointer"
                  id="btn-confirm-booking"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirmando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirmar Reserva Real</span>
                    </>
                  )}
                </button>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
}
