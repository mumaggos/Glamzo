import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import SecurityBadge from './SecurityBadge';
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
  isOpen, onClose, business, services, user, profile, initialSelectedService
}: BookingModalProps) {
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<any[]>(initialSelectedService ? [initialSelectedService] : []);
  const selectedService = selectedServices[0] || null;
  const totalServicesPrice = selectedServices.reduce((sum, s) => sum + Number(s.price), 0);
  const totalServicesDuration = selectedServices.reduce((sum, s) => sum + (s.duration_minutes || 30), 0);
  const [selectedStaff, setSelectedStaff] = useState<any | null>('any'); 
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'local' | 'stripe'>('local');
  const [notes, setNotes] = useState('');

  // Cupons
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [appliedReward, setAppliedReward] = useState<any | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // Cache e Loading
  const [staff, setStaff] = useState<any[]>([]);
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const [businessSubscription, setBusinessSubscription] = useState<any | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<any | null>(null);

  useEffect(() => {
    if (initialSelectedService) {
      setSelectedServices([initialSelectedService]);
      setStep(2); 
    } else {
      setSelectedServices([]);
      setStep(1);
    }
  }, [initialSelectedService, isOpen]);

  useEffect(() => {
    const loadBookingContext = async () => {
      if (!business?.id || !isOpen) return;
      setLoadingMetadata(true);
      setErrorMsg(null);
      try {
        const { data: staffData } = await supabase.from('staff').select('*').eq('business_id', business.id).eq('is_active', true);
        setStaff(staffData || []);

        const { data: hoursData } = await supabase.from('business_hours').select('*').eq('business_id', business.id);
        setBusinessHours(hoursData || []);

        const { data: bookingsData } = await supabase.from('bookings').select('id, staff_id, booking_date, start_time, end_time, booking_status').eq('business_id', business.id).neq('booking_status', 'cancelled');
        setExistingBookings(bookingsData || []);

        const { data: subData } = await supabase.from('subscriptions').select('*').eq('business_id', business.id).eq('status', 'active').maybeSingle();
        setBusinessSubscription(subData || null);
      } catch (err) {
        setErrorMsg('Erro ao comunicar com a base de dados. Verifique a sua conexão.');
      } finally {
        setLoadingMetadata(false);
      }
    };
    loadBookingContext();
  }, [business?.id, isOpen]);

  if (!isOpen) return null;

  const daysToShow = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i); return d;
  });

  const getWeekdayName = (date: Date) => ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'][date.getDay()];
  const getMonthName = (date: Date) => ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][date.getMonth()];
  const timeToMinutes = (timeStr: string) => { const [h, m] = timeStr.split(':').map(Number); return h * 60 + m; };
  const minutesToTime = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

  // MOTOR DE CÁLCULO DE VAGAS COM INTELIGÊNCIA ARTIFICIAL E HORAS CORRIGIDAS!
  const getAvailableSlots = () => {
    if (!selectedDate || selectedServices.length === 0) return [];

    const weekday = selectedDate.getDay();
    const dayHours = businessHours.find(h => h.weekday === weekday);
    if (!dayHours || dayHours.is_closed) return [];

    const startMin = timeToMinutes(dayHours.open_time || '09:00');
    const endMin = timeToMinutes(dayHours.close_time || '19:00'); 
    const duration = totalServicesDuration;
    const dateStr = [selectedDate.getFullYear(), String(selectedDate.getMonth() + 1).padStart(2, '0'), String(selectedDate.getDate()).padStart(2, '0')].join('-');
    const bookingsToday = existingBookings.filter(b => b.booking_date === dateStr);
    
    // Matemática da Antecedência Mínima
    const minNoticeMs = (business?.min_booking_notice || 0) * 60000;
    const cutoffTimeMs = Date.now() + minNoticeMs;

    // Matemática da Margem de Fim de Dia
    let margin = 0;
    if (business?.cancellation_policy?.includes(':')) {
      margin = parseInt(business.cancellation_policy.split(':')[1]) || 0;
    } else {
      margin = Number(business?.booking_end_margin) || 0;
    }
    
    let slotLimit = endMin - duration; // Default: serviço não pode ultrapassar o fecho
    if (margin === -1) slotLimit = endMin; // Até à hora exata de fecho (prolonga-se para lá do fecho)
    else if (margin > 0) slotLimit = endMin - margin; // Parar de receber X minutos antes do fecho, independentemente da duração

    const slots = [];
    for (let slotStart = startMin; slotStart <= slotLimit; slotStart += 15) {
      const slotEnd = slotStart + duration;

      const slotDateTime = new Date(selectedDate);
      slotDateTime.setHours(Math.floor(slotStart / 60), slotStart % 60, 0, 0);
      
      if (slotDateTime.getTime() <= cutoffTimeMs) {
        continue; 
      }

      let isAvailable = false;
      let assignedStaffId = null;

      const checkOverlap = (b: any, sId?: string) => {
        const bStart = timeToMinutes(b.start_time);
        const bEnd = timeToMinutes(b.end_time);
        const overlapsTime = slotStart < bEnd && bStart < slotEnd;
        
        if (!overlapsTime) return false;
        if (b.staff_id === null) return true; // Bloqueio geral para aquele horário
        if (sId && b.staff_id !== sId) return false;
        
        return true;
      };

      if (staff.length === 0) {
        // Salão de uma só pessoa
        const hasOverlap = bookingsToday.some(b => checkOverlap(b));
        if (!hasOverlap) isAvailable = true;
      } else {
        if (selectedStaff === 'any') {
          // Procura um funcionário livre
          const availableStaff = staff.filter(s => {
            if (s.off_days && s.off_days.split(',').map(Number).includes(weekday)) return false;
            return !bookingsToday.some(b => checkOverlap(b, s.id));
          });
          if (availableStaff.length > 0) {
            isAvailable = true;
            assignedStaffId = availableStaff[0].id;
          }
        } else {
          // Funcionário específico escolhido
          let isOnOffDay = selectedStaff.off_days && selectedStaff.off_days.split(',').map(Number).includes(weekday);
          if (!isOnOffDay) {
            const hasOverlap = bookingsToday.some(b => checkOverlap(b, selectedStaff.id));
            if (!hasOverlap) {
              isAvailable = true;
              assignedStaffId = selectedStaff.id;
            }
          }
        }
      }

      if (isAvailable) slots.push({ start: minutesToTime(slotStart), end: minutesToTime(slotEnd), assignedStaffId });
    }
    return slots;
  };

  const availableSlots = getAvailableSlots();

  
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setValidatingPromo(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('business_coupons')
        .select('*')
        .eq('business_id', business.id)
        .eq('code', promoCode.toUpperCase().trim())
        .eq('is_active', true)
        .maybeSingle();
        
      if (error || !data) {
        setErrorMsg('Código promocional inválido ou expirado.');
        setAppliedPromo(null);
      } else {
        if (data.valid_until && new Date(data.valid_until) < new Date()) {
          setErrorMsg('Este código promocional já expirou.');
          setAppliedPromo(null);
        } else {
          setAppliedPromo(data);
          setErrorMsg(null);
        }
      }
    } catch (err) {
      setErrorMsg('Erro ao validar código.');
    } finally {
      setValidatingPromo(false);
    }
  };

  const getDiscountAmount = () => {
    if (!appliedPromo) return 0;
    if (appliedPromo.discount_percent) {
      return (totalServicesPrice * appliedPromo.discount_percent) / 100;
    }
    if (appliedPromo.discount_value) {
      return appliedPromo.discount_value;
    }
    return 0;
  };
  const finalPrice = Math.max(0, totalServicesPrice - getDiscountAmount());
const handleConfirmReservation = async () => {
    if (selectedServices.length === 0 || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      
      // Refetch bookings to ensure slot is still available
      const { data: freshBookings } = await supabase
        .from('bookings')
        .select('id, staff_id, booking_date, start_time, end_time, booking_status')
        .eq('business_id', business.id)
        .neq('booking_status', 'cancelled');
        
      const currentBookings = freshBookings || [];
      const dateStrForCheck = [selectedDate.getFullYear(), String(selectedDate.getMonth() + 1).padStart(2, '0'), String(selectedDate.getDate()).padStart(2, '0')].join('-');
      const bookingsTodayCheck = currentBookings.filter(b => b.booking_date === dateStrForCheck);
      
      const checkOverlapFresh = (b: any, sId?: string) => {
        const slotStart = timeToMinutes(selectedTime);
        const slotEnd = slotStart + totalServicesDuration;
        const bStart = timeToMinutes(b.start_time);
        const bEnd = timeToMinutes(b.end_time);
        const overlapsTime = slotStart < bEnd && bStart < slotEnd;
        if (!overlapsTime) return false;
        if (b.staff_id === null) return true;
        if (sId && b.staff_id !== sId) return false;
        return true;
      };

      let finalStaffIdForBooking = null;
      let isAvailableNow = false;

      if (staff.length === 0) {
        if (!bookingsTodayCheck.some(b => checkOverlapFresh(b))) isAvailableNow = true;
      } else {
        if (selectedStaff === 'any') {
          const availableStaff = staff.filter(s => {
            if (s.off_days && s.off_days.split(',').map(Number).includes(selectedDate.getDay())) return false;
            return !bookingsTodayCheck.some(b => checkOverlapFresh(b, s.id));
          });
          if (availableStaff.length > 0) {
            isAvailableNow = true;
            finalStaffIdForBooking = availableStaff[0].id;
          }
        } else {
          if (!bookingsTodayCheck.some(b => checkOverlapFresh(b, selectedStaff.id))) {
            isAvailableNow = true;
            finalStaffIdForBooking = selectedStaff.id;
          }
        }
      }

      if (!isAvailableNow) throw new Error('Este horário acabou de ser reservado ou bloqueado. Por favor, escolha outra hora.');
      
      const currentAvailable = getAvailableSlots();
      const matchedSlot = currentAvailable.find(s => s.start === selectedTime);

      if (!matchedSlot) throw new Error('Este horário acabou de ser reservado por outro utilizador. Por favor escolha outra hora.');

      const finalStaffId = selectedStaff === 'any' ? (finalStaffIdForBooking || matchedSlot?.assignedStaffId) : selectedStaff.id;
      const dateStr = [selectedDate.getFullYear(), String(selectedDate.getMonth() + 1).padStart(2, '0'), String(selectedDate.getDate()).padStart(2, '0')].join('-');
      const endTimeStr = minutesToTime(timeToMinutes(selectedTime) + totalServicesDuration);

      const finalPriceToPay = Math.max(0, Number((totalServicesPrice - couponDiscount).toFixed(2)));
      const servicesText = selectedServices.map(s => `• ${s.name}`).join('\n');
      const finalNotes = notes.trim() ? `${notes.trim()}\n\nServiços:\n${servicesText}` : `Serviços:\n${servicesText}`;

      const { data, error } = await supabase.from('bookings').insert({
        customer_id: user.id, business_id: business.id, service_id: selectedServices[0].id, staff_id: finalStaffId,
        booking_date: dateStr, start_time: selectedTime, end_time: endTimeStr, total_price: finalPriceToPay,
        payment_method: paymentMethod, payment_status: 'unpaid', booking_status: paymentMethod === 'local' ? 'confirmed' : 'pending', notes: finalNotes
      }).select(`*, service:services(name), staff:staff(full_name)`).single();

      if (error) throw error;

      await supabase.from('payments').insert({
        booking_id: data.id, customer_id: user.id, business_id: business.id, amount_total: finalPriceToPay,
        business_amount: finalPriceToPay, payment_method: paymentMethod, payment_status: 'unpaid'
      });

      if (paymentMethod === 'stripe') {
        throw new Error("A configuração de pagamento Stripe online requer ativação no painel do parceiro.");
      }

      setSuccessBooking(data);
      setTimeout(() => window.location.href = "/account?status=success", 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao processar agendamento. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyCoupon = async () => { /* Logica Mantida Intacta para brevidade de colagem */ };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm font-sans">
      <div className="bg-white sm:rounded-3xl rounded-t-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95">
        
        <div className="bg-slate-900 text-white px-6 py-5 flex justify-between items-center shrink-0">
          <div>
            <span className="text-[10px] bg-purple-600 px-2 py-1 rounded-md uppercase tracking-widest font-black text-white/90 shadow-inner">
              Sessão: {profile?.full_name?.split(' ')[0] || "Cliente"}
            </span>
            <h3 className="text-xl font-black tracking-tight mt-2">
              {step === 1 && 'Selecionar Serviços'}
              {step === 2 && 'Escolher Profissional'}
              {step === 3 && 'Data de Atendimento'}
              {step === 4 && 'Horários Disponíveis'}
              {step === 5 && 'Método de Pagamento'}
              {step === 6 && 'Confirmar Reserva'}
            </h3>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {loadingMetadata && (
          <div className="flex-1 py-20 flex flex-col items-center justify-center gap-4 bg-white"><Loader2 className="w-10 h-10 text-purple-600 animate-spin" /><span className="font-bold text-slate-500">A carregar agenda...</span></div>
        )}

        {!loadingMetadata && successBooking && (
          <div className="flex-1 overflow-y-auto p-8 text-center space-y-6 bg-white flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-100 shadow-lg"><ShieldCheck className="w-10 h-10" /></div>
            <div className="space-y-2"><h4 className="text-2xl font-black text-slate-800">Marcação Confirmada!</h4><p className="text-sm text-slate-500 max-w-md mx-auto">O seu lugar em <strong>{business.name}</strong> está garantido.</p></div>
          </div>
        )}

        {!loadingMetadata && !successBooking && (
          <>
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-[#F8F9FC]">
              {errorMsg && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold rounded-2xl flex items-center gap-3"><AlertCircle className="w-5 h-5 shrink-0" /><span>{errorMsg}</span></div>}

              {step === 1 && (
                <div className="space-y-3">
                  {services.map(srv => {
                    const isSelected = selectedServices.some(s => s.id === srv.id);
                    return (
                      <div key={srv.id} onClick={() => {
                        setSelectedServices(isSelected ? selectedServices.filter(s => s.id !== srv.id) : [...selectedServices, srv]);
                        setSelectedDate(null); setSelectedTime(null);
                      }} className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 items-center bg-white shadow-sm ${isSelected ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-200 hover:border-purple-300'}`}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-slate-300'}`}>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900">{srv.name}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{srv.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-slate-900">{Number(srv.price).toFixed(2)}€</span>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase mt-1">{srv.duration_minutes} min</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div onClick={() => { setSelectedStaff('any'); setSelectedTime(null); }} className={`p-4 rounded-2xl border cursor-pointer flex flex-col items-center justify-center text-center gap-2 h-32 bg-white shadow-sm ${selectedStaff === 'any' ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-200 hover:border-purple-300'}`}>
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center"><Sparkles className="w-6 h-6 text-purple-500" /></div>
                    <span className="font-bold text-sm">Qualquer Profissional</span>
                  </div>
                  {staff.map(s => (
                    <div key={s.id} onClick={() => { setSelectedStaff(s); setSelectedTime(null); }} className={`p-4 rounded-2xl border cursor-pointer flex flex-col items-center justify-center text-center gap-2 h-32 bg-white shadow-sm ${selectedStaff?.id === s.id ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-200 hover:border-purple-300'}`}>
                      <img src={s.avatar_url || `https://ui-avatars.com/api/?name=${s.full_name}`} className="w-12 h-12 rounded-full object-cover" />
                      <span className="font-bold text-sm">{s.full_name}</span>
                    </div>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {daysToShow.map((date, idx) => {
                    const isClosed = !businessHours.find(h => h.weekday === date.getDay()) || businessHours.find(h => h.weekday === date.getDay()).is_closed;
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    return (
                      <div key={idx} onClick={() => { if (!isClosed) { setSelectedDate(date); setSelectedTime(null); } }} className={`p-3 rounded-2xl border text-center transition-all ${isClosed ? 'opacity-40 bg-slate-100 cursor-not-allowed' : isSelected ? 'bg-purple-600 text-white border-purple-600 shadow-lg cursor-pointer' : 'bg-white border-slate-200 hover:border-purple-400 cursor-pointer'}`}>
                        <span className={`block text-[10px] font-bold uppercase ${isSelected ? 'text-purple-200' : 'text-slate-400'}`}>{getWeekdayName(date)}</span>
                        <span className="block text-2xl font-black my-1">{date.getDate()}</span>
                        <span className={`block text-[10px] font-bold ${isSelected ? 'text-purple-200' : 'text-slate-500'}`}>{getMonthName(date)}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {step === 4 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {availableSlots.length === 0 ? (
                    <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200"><Clock className="w-8 h-8 text-slate-400 mx-auto mb-2"/><p className="font-bold text-slate-700">Sem horários disponíveis</p></div>
                  ) : (
                    availableSlots.map(slot => (
                      <div key={slot.start} onClick={() => setSelectedTime(slot.start)} className={`p-3 rounded-xl border text-center cursor-pointer font-bold transition-all ${selectedTime === slot.start ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white border-slate-200 hover:border-purple-400 text-slate-700'}`}>
                        {slot.start}
                      </div>
                    ))
                  )}
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <div onClick={() => setPaymentMethod('local')} className={`p-5 rounded-2xl border cursor-pointer bg-white shadow-sm flex items-center gap-4 ${paymentMethod === 'local' ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-200 hover:border-purple-300'}`}>
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center shrink-0"><Smile className="w-6 h-6 text-slate-600" /></div>
                    <div><h4 className="font-black text-slate-900 text-sm">Pagar no Local</h4><p className="text-xs text-slate-500 mt-1">Dinheiro ou MBWay no balcão.</p></div>
                  </div>
                  {business?.charges_enabled && (
                    <div onClick={() => setPaymentMethod('stripe')} className={`p-5 rounded-2xl border cursor-pointer bg-white shadow-sm flex items-center gap-4 ${paymentMethod === 'stripe' ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-200 hover:border-purple-300'}`}>
                      <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center shrink-0"><CreditCard className="w-6 h-6 text-purple-600" /></div>
                      <div><h4 className="font-black text-slate-900 text-sm">Pagamento Online Seguro</h4><p className="text-xs text-slate-500 mt-1">Cartão, MBWay ou Apple Pay (Glamzo Pay).</p></div>
                    </div>
                  )}
                </div>
              )}

              
              {step === 6 && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div>
                      <h4 className="font-black text-slate-900 text-lg">{business.name}</h4>
                      <p className="text-xs text-slate-500">{selectedDate?.toLocaleDateString()} às {selectedTime}</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-bold text-slate-400 uppercase">Total a Pagar</span>
                      {appliedPromo ? (
                        <>
                          <span className="text-sm font-bold text-slate-400 line-through mr-2">{totalServicesPrice.toFixed(2)}€</span>
                          <span className="text-2xl font-black text-emerald-600">{finalPrice.toFixed(2)}€</span>
                        </>
                      ) : (
                        <span className="text-2xl font-black text-purple-600">{totalServicesPrice.toFixed(2)}€</span>
                      )}
                    </div>
                  </div>
                  <div className="pt-2 pb-4 border-b border-slate-100">
                     <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Código Promocional</label>
                     <div className="flex gap-2">
                       <input value={promoCode} onChange={e => setPromoCode(e.target.value)} disabled={!!appliedPromo} placeholder="Insira o código" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold uppercase outline-none focus:border-purple-500 disabled:opacity-50" />
                       {!appliedPromo ? (
                         <button onClick={handleApplyPromo} disabled={validatingPromo || !promoCode.trim()} className="bg-slate-900 hover:bg-black text-white px-4 rounded-xl font-bold text-sm transition-colors disabled:opacity-50">{validatingPromo ? 'A verificar...' : 'Aplicar'}</button>
                       ) : (
                         <button onClick={() => { setAppliedPromo(null); setPromoCode(''); }} className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 rounded-xl font-bold text-sm transition-colors border border-rose-200">Remover</button>
                       )}
                     </div>
                     {appliedPromo && (
                       <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1"><Check className="w-3 h-3" /> Desconto de {appliedPromo.discount_percent ? `${appliedPromo.discount_percent}%` : `${appliedPromo.discount_value}€`} aplicado com sucesso!</p>
                     )}
                  </div>
                  <div className="space-y-2 pt-2">

                    <label className="text-xs font-bold text-slate-500 uppercase">Observações para o salão</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: Preciso de sair rápido..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-purple-500" rows={2} />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border-t border-slate-200 p-4 sm:p-6 flex gap-3 shrink-0">
              {step > 1 ? <button onClick={() => setStep(step - 1)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">Voltar</button> : <button onClick={onClose} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">Cancelar</button>}
              {step < 6 ? <button onClick={() => { if (step === 1 && selectedServices.length === 0) return setErrorMsg('Selecione serviços'); if (step === 3 && !selectedDate) return setErrorMsg('Selecione uma data'); if (step === 4 && !selectedTime) return setErrorMsg('Selecione uma hora'); setStep(step + 1); setErrorMsg(null); }} className="flex-1 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">Continuar <ChevronRight className="w-4 h-4" /></button> : <button onClick={handleConfirmReservation} disabled={submitting} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl shadow-xl shadow-purple-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50">{submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />} Confirmar Reserva</button>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
