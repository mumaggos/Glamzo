import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { slugify, generateUniqueSlug } from '../../utils/slugify';
import { PORTUGAL_GEO, getCoordinatesForCity } from '../../utils/geoData';
import { optimizeImageBeforeUpload } from '../../utils/imageOptimizer';
import {
  Store, Loader2, Check, ArrowRight, ArrowLeft, Building2, MapPin, 
  Phone, Mail, FileText, Image, Scissors, MonitorSmartphone, CreditCard, User
} from 'lucide-react';

export default function SetupWizard() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Step 1: Business Details
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cabelo & Barbearia');
  const [phone, setPhone] = useState('');
  const [publicEmail, setPublicEmail] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('Lisboa');
  const [district, setDistrict] = useState('Lisboa');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // Step 2: Services
  const [services, setServices] = useState<any[]>([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('30');

  // Step 3: Plan
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'pro_terminal' | null>(null);

  // Step 4: Payments
  const [acceptsOnlinePayments, setAcceptsOnlinePayments] = useState<boolean | null>(null);

  // Step 5: Staff (Optional)
  const [staffName, setStaffName] = useState('');

  useEffect(() => {
    async function initSetup() {
      if (!user) return;
      
      try {
        const { data: business } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle();

        if (business) {
          if (business.setup_completed) {
            navigate('/dashboard', { replace: true });
            return;
          }
          
          setBusinessId(business.id);
          setCurrentStep(business.setup_step || 1);
          
          setName(business.name || '');
          setCategory(business.category || 'Cabelo & Barbearia');
          setPhone(business.phone || '');
          setPublicEmail(business.email || '');
          setAddressLine1(business.address || business.address_line_1 || '');
          setAddressLine2(business.door_number || business.address_line_2 || '');
          setPostalCode(business.postal_code || '');
          setCity(business.city || 'Lisboa');
          setDistrict(business.district || 'Lisboa');
          setDescription(business.description || '');
          setLogoUrl(business.logo_url || '');
          setCoverUrl(business.cover_url || '');
          setSelectedPlan(business.selected_plan_code as any);
          
          if (business.accepts_online_payments !== null) {
             setAcceptsOnlinePayments(business.accepts_online_payments);
          }

          // Fetch existing services
          const { data: srvs } = await supabase
            .from('services')
            .select('*')
            .eq('business_id', business.id);
            
          if (srvs) setServices(srvs);
        }
      } catch (err) {
        console.error('Error fetching business setup state:', err);
      } finally {
        setLoading(false);
      }
    }
    initSetup();
  }, [user, navigate]);

  const saveProgress = async (stepNumber: number, data: any = {}) => {
    if (!user) return null;
    try {
      let currentBizId = businessId;
      
      if (!currentBizId) {
        // Initial insert
        const slug = await generateUniqueSlug(data.name || 'Nova Loja');
        const { latitude, longitude } = getCoordinatesForCity(data.district || 'Lisboa', data.city || 'Lisboa');
        
        const payload = {
          owner_id: user.id,
          name: data.name,
          slug,
          status: 'setup',
          setup_step: stepNumber,
          category: data.category,
          phone: data.phone,
          email: data.publicEmail,
          address: data.addressLine1,
          address_line_1: data.addressLine1,
          door_number: data.addressLine2,
          address_line_2: data.addressLine2,
          postal_code: data.postalCode,
          city: data.city,
          district: data.district,
          description: data.description,
          logo_url: data.logoUrl,
          cover_url: data.coverUrl,
          latitude,
          longitude
        };

        const { data: newBiz, error } = await supabase
          .from('businesses')
          .insert(payload)
          .select('id')
          .maybeSingle();

        if (error) throw error;
        currentBizId = newBiz?.id;
        setBusinessId(currentBizId);
      } else {
        // Update existing
        const { error } = await supabase
          .from('businesses')
          .update({
            setup_step: stepNumber,
            last_onboarding_update_at: new Date().toISOString(),
            ...data
          })
          .eq('id', currentBizId);
          
        if (error) throw error;
      }
      
      return currentBizId;
    } catch (err: any) {
      console.error('Error saving progress:', err);
      // Fallback update without new schema columns if they don't exist yet
      if (businessId && data.selected_plan_code) {
         try {
             await supabase.from('businesses').update({
                 setup_step: stepNumber
             }).eq('id', businessId);
             return businessId;
         } catch (e) {}
      }
      throw err;
    }
  };

  const handleNextStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    
    try {
      await saveProgress(2, {
        name, category, phone, publicEmail, addressLine1, addressLine2,
        postalCode, city, district, description, logoUrl, coverUrl
      });
      setCurrentStep(2);
    } catch (err: any) {
      setErrorMsg('Erro ao guardar dados. ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddService = async () => {
    if (!newServiceName || !newServicePrice || !businessId) return;
    
    try {
      const { data, error } = await supabase.from('services').insert({
        business_id: businessId,
        name: newServiceName,
        price: parseFloat(newServicePrice),
        duration_minutes: parseInt(newServiceDuration),
        is_active: true
      }).select().single();
      
      if (error) throw error;
      if (data) {
        setServices([...services, data]);
        setNewServiceName('');
        setNewServicePrice('');
        setNewServiceDuration('30');
      }
    } catch (err: any) {
      setErrorMsg('Erro ao adicionar serviço.');
    }
  };

  const handleNextStep2 = async () => {
    if (services.length === 0) {
      setErrorMsg('Adicione pelo menos um serviço para os clientes conseguirem reservar.');
      return;
    }
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await saveProgress(3);
      setCurrentStep(3);
    } catch (err) {
      setErrorMsg('Erro ao avançar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextStep3 = async () => {
    if (!selectedPlan) {
      setErrorMsg('Por favor, escolha um plano para continuar.');
      return;
    }
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await saveProgress(4, {
        selected_plan_code: selectedPlan,
        selected_plan_name: selectedPlan === 'pro' ? 'PRO' : 'PRO TERMINAL',
        tablet_requested: selectedPlan === 'pro_terminal',
        tablet_deposit_amount: selectedPlan === 'pro_terminal' ? 9.99 : null
      });
      setCurrentStep(4);
    } catch (err) {
      setErrorMsg('Erro ao guardar plano.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextStep4 = async () => {
    if (acceptsOnlinePayments === null) {
      setErrorMsg('Indique se pretende aceitar pagamentos online.');
      return;
    }
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await saveProgress(5, {
        accepts_online_payments: acceptsOnlinePayments,
        payments_mode: acceptsOnlinePayments ? 'online_enabled' : 'offline_only'
      });
      // Skip Staff step for now and go to review
      setCurrentStep(6);
    } catch (err) {
      setErrorMsg('Erro ao guardar preferência de pagamentos.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      // Final activation
      await supabase.from('businesses').update({
        status: 'active',
        setup_completed: true,
        setup_step: 6,
        onboarding_completed_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
        is_visible_in_marketplace: true, // Visible as long as trial/sub is active
        subscription_status: 'trialing', // Start 14-day trial logically
        trial_used: true
      }).eq('id', businessId);
      
      // Update role to be sure
      if (user) {
        await supabase.from('profiles').update({ role: 'business' }).eq('id', user.id);
        localStorage.setItem(`local_role_${user.id}`, 'business');
        await refreshProfile();
      }
      
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setErrorMsg('Erro ao ativar a loja. ' + err.message);
      setSubmitting(false);
    }
  };

  if (!user) return <Navigate to="/partner/login" replace />;
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 font-sans selection:bg-purple-200">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden relative">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
          <div 
            className="h-full bg-purple-600 transition-all duration-500 ease-out" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        <div className="p-8 sm:p-12">
          <div className="mb-8">
            <span className="text-xs font-black text-purple-600 tracking-widest uppercase">Passo {currentStep} de {totalSteps}</span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1 uppercase tracking-tight">Configuração da Loja</h1>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: BUSINESS DETAILS */}
          {currentStep === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-5 animate-fade-in">
              <p className="text-sm text-slate-500 mb-6 font-medium">Preencha os dados reais do seu negócio para aparecer no marketplace.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nome da Loja *</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all" placeholder="Ex: Glamour Studio" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Categoria *</label>
                  <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all">
                    <option value="Cabelo & Barbearia">Cabelo & Barbearia</option>
                    <option value="Estética">Estética</option>
                    <option value="Nails & Beauty">Nails & Beauty</option>
                    <option value="Spa & Wellness">Spa & Wellness</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Telefone Comercial *</label>
                  <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all" placeholder="Telefone" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">E-mail Público *</label>
                  <input type="email" required value={publicEmail} onChange={e => setPublicEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all" placeholder="geral@loja.pt" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Morada (Linha 1) *</label>
                  <input type="text" required value={addressLine1} onChange={e => setAddressLine1(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all" placeholder="Rua principal" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Porta / Andar</label>
                    <input type="text" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all" placeholder="Ex: 12C" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Código Postal *</label>
                    <input type="text" required value={postalCode} onChange={e => setPostalCode(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all" placeholder="1000-100" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Distrito *</label>
                    <select required value={district} onChange={e => { setDistrict(e.target.value); setCity(PORTUGAL_GEO[e.target.value]?.[0] || ''); }} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all">
                      {Object.keys(PORTUGAL_GEO).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Cidade *</label>
                    <select required value={city} onChange={e => setCity(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all">
                      {(PORTUGAL_GEO[district] || []).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Avançar'}
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: SERVICES */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <p className="text-sm text-slate-500 font-medium">Adicione pelo menos um serviço para os clientes conseguirem reservar.</p>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nome do Serviço</label>
                    <input type="text" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Ex: Corte de Cabelo" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Preço (€)</label>
                    <input type="number" step="0.01" value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="15.00" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Duração (Min)</label>
                    <input type="number" step="5" value={newServiceDuration} onChange={e => setNewServiceDuration(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                  </div>
                </div>
                <button type="button" onClick={handleAddService} disabled={!newServiceName || !newServicePrice} className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors disabled:opacity-50">
                  Adicionar Serviço
                </button>
              </div>

              {services.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Serviços Adicionados</h4>
                  {services.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Scissors className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold text-sm">{s.name}</span>
                      </div>
                      <div className="text-sm font-medium text-slate-600">
                        {s.duration_minutes} min • {s.price} €
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-6 flex justify-between">
                <button type="button" onClick={() => setCurrentStep(1)} className="px-6 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-xs uppercase transition-colors">Voltar</button>
                <button type="button" onClick={handleNextStep2} disabled={submitting || services.length === 0} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Avançar'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PLAN */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <p className="text-sm text-slate-500 font-medium">Escolha o plano ideal para a sua loja. Ambos incluem 14 dias de teste grátis.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button type="button" onClick={() => setSelectedPlan('pro')} className={`text-left p-6 rounded-2xl border-2 transition-all ${selectedPlan === 'pro' ? 'border-purple-600 bg-purple-50/50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">PRO</h3>
                  <p className="text-2xl font-black text-purple-600 mb-4">19,99 € <span className="text-sm font-medium text-slate-500">/mês</span></p>
                  <ul className="text-sm text-slate-600 space-y-2 mb-6">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Visibilidade no Marketplace</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Agenda Ilimitada</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Gestão de Clientes</li>
                  </ul>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Apenas Plataforma Online</div>
                </button>

                <button type="button" onClick={() => setSelectedPlan('pro_terminal')} className={`text-left p-6 rounded-2xl border-2 transition-all ${selectedPlan === 'pro_terminal' ? 'border-purple-600 bg-purple-50/50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">PRO TERMINAL</h3>
                  <p className="text-2xl font-black text-purple-600 mb-4">24,99 € <span className="text-sm font-medium text-slate-500">/mês</span></p>
                  <ul className="text-sm text-slate-600 space-y-2 mb-6">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Tudo no plano PRO</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Tablet Físico para a Loja</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Suporte Dedicado</li>
                  </ul>
                  <div className="p-3 bg-purple-100/50 rounded-xl text-xs font-medium text-purple-800">
                    <MonitorSmartphone className="w-4 h-4 inline mr-1" /> Caução de equipamento: 9,99 € (reembolsável)
                  </div>
                </button>
              </div>

              <div className="pt-6 flex justify-between">
                <button type="button" onClick={() => setCurrentStep(2)} className="px-6 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-xs uppercase transition-colors">Voltar</button>
                <button type="button" onClick={handleNextStep3} disabled={submitting || !selectedPlan} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Avançar'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENTS */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <p className="text-sm text-slate-500 font-medium">Pretende aceitar pagamentos online dos clientes diretamente na plataforma?</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button type="button" onClick={() => setAcceptsOnlinePayments(true)} className={`text-left p-6 rounded-2xl border-2 transition-all ${acceptsOnlinePayments === true ? 'border-emerald-600 bg-emerald-50/50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                  <CreditCard className={`w-8 h-8 mb-4 ${acceptsOnlinePayments === true ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <h3 className="text-md font-bold text-slate-900 mb-2">Sim, Aceitar Pagamentos</h3>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">Permite cobrar aos clientes no momento da reserva online. (Taxa de plataforma 5%). Requer configuração do Stripe no painel.</p>
                </button>

                <button type="button" onClick={() => setAcceptsOnlinePayments(false)} className={`text-left p-6 rounded-2xl border-2 transition-all ${acceptsOnlinePayments === false ? 'border-purple-600 bg-purple-50/50 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                  <Store className={`w-8 h-8 mb-4 ${acceptsOnlinePayments === false ? 'text-purple-600' : 'text-slate-400'}`} />
                  <h3 className="text-md font-bold text-slate-900 mb-2">Não, Apenas no Local</h3>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">Os clientes fazem a reserva online mas pagam presencialmente na sua loja. Pode alterar isto mais tarde no painel.</p>
                </button>
              </div>

              <div className="pt-6 flex justify-between">
                <button type="button" onClick={() => setCurrentStep(3)} className="px-6 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-xs uppercase transition-colors">Voltar</button>
                <button type="button" onClick={handleNextStep4} disabled={submitting || acceptsOnlinePayments === null} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Avançar'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW & ACTIVATE */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fade-in text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase">Tudo Pronto!</h2>
              <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                A sua loja <strong>{name}</strong> está configurada. Irá arrancar com o plano <strong>{selectedPlan === 'pro' ? 'PRO' : 'PRO TERMINAL'}</strong> e 14 dias de teste gratuito.
              </p>

              {acceptsOnlinePayments && (
                 <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs max-w-md mx-auto text-left">
                   <strong>Aviso:</strong> Escolheu aceitar pagamentos online. Não se esqueça de ativar a sua conta Stripe Connect no seu Dashboard para poder receber os pagamentos.
                 </div>
              )}
              {selectedPlan === 'pro_terminal' && (
                 <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-xs max-w-md mx-auto text-left">
                   <strong>Equipamento:</strong> Iremos contactar em breve para combinar o envio do seu Tablet e o pagamento da caução.
                 </div>
              )}

              <div className="pt-8 flex justify-center">
                <button type="button" onClick={handleFinish} disabled={submitting} className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-purple-200 disabled:opacity-50 w-full sm:w-auto">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ativar Loja & Entrar'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
