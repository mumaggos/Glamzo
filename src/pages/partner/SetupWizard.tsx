import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { 
  Building2, Scissors, CreditCard, Landmark, CheckCircle, 
  ArrowRight, ArrowLeft, Loader2, Sparkles, Check, Lock, MapPin, Phone, Mail, FileText
} from 'lucide-react';
import { generateUniqueSlug } from '../../utils/slugify';

export default function SetupWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Step 1: Data
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Step 2: Services
  const [services, setServices] = useState<any[]>([]);

  // Step 3: Plan
  const [selectedPlan, setSelectedPlan] = useState<'PRO' | 'TERMINAL'>('PRO');
  const [shippingName, setShippingName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingPostalCode, setShippingPostalCode] = useState('');
  const [shippingCity, setShippingCity] = useState('');

  useEffect(() => {
    fetchBusiness();
  }, [user]);

  useEffect(() => {
    const status = searchParams.get('status');

    if (status === 'stripe_cancelled') {
      setErrorMsg('Pagamento cancelado ou não concluído.');
      window.history.replaceState({}, document.title, '/partner/setup');
    }
  }, [searchParams, business]);

  const fetchBusiness = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: biz, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      let currentBiz = biz;
      
      if (!currentBiz) {
        // Create initial placeholder business idempotently
        const slug = await generateUniqueSlug(`loja-${user.id.substring(0, 8)}`);
        const payload = {
          owner_id: user.id,
          name: '',
          email: user.email || '',
          phone: '',
          address: '',
          city: '',
          district: '', 
          postal_code: '',
          status: 'setup',
          setup_step: 1,
          setup_completed: false,
          slug: slug,
          category: 'Cabelo & Barbearia'
        };
        
        const { data: newBiz, error: createErr } = await supabase.from('businesses').insert(payload).select().single();
          
        if (createErr) {
          if (createErr.code === '23505') {
            const { data: existingBiz } = await supabase.from('businesses').select('*').eq('owner_id', user.id).single();
            currentBiz = existingBiz;
          } else if (createErr.code === '42703' || createErr.message?.includes('column')) {
            const fallbackPayload = { ...payload };
            delete (fallbackPayload as any).setup_step;
            delete (fallbackPayload as any).setup_completed;
            const { data: fbBiz } = await supabase.from('businesses').insert(fallbackPayload).select().single();
            currentBiz = fbBiz;
          } else {
             throw createErr;
          }
        } else {
          currentBiz = newBiz;
        }
      }

      if (currentBiz) {
        setBusiness(currentBiz);
        if (currentBiz.status === 'active' && currentBiz.setup_completed) {
          navigate('/partner/dashboard', { replace: true });
          return;
        }
        
        setName(currentBiz.name || '');
        setPhone(currentBiz.phone || '');
        setEmail(currentBiz.email || '');
        setAddress(currentBiz.address || '');
        setCity(currentBiz.city || '');
        setPostalCode(currentBiz.postal_code || '');
        
        // Restore step
        if (!searchParams.get('status') && currentBiz.setup_step) {
          let targetStep = currentBiz.setup_step;
          if (targetStep === 3 && (currentBiz.subscription_active || currentBiz.stripe_subscription_id)) {
            targetStep = 4;
          }
          setStep(targetStep);
        }

        const { data: svcs } = await supabase.from('services').select('*').eq('business_id', currentBiz.id);
        if (svcs) setServices(svcs);
        
        const { data: order } = await supabase.from('tablet_orders').select('*').eq('business_id', currentBiz.id).maybeSingle();
        if (order) {
          setSelectedPlan('TERMINAL');
          setShippingName(order.shipping_name || '');
          setShippingPhone(order.shipping_phone || '');
          setShippingAddress(order.shipping_address || '');
          setShippingPostalCode(order.shipping_postal_code || '');
          setShippingCity(order.shipping_city || '');
        }
      }
    } catch (err: any) {
      setErrorMsg('Erro ao preparar a configuração da loja: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSetupStep = async (newStep: number) => {
    if (!business) return;
    
    let targetStep = newStep;
    // Auto-forward/skip plan selection if already has an active plan
    if (targetStep === 3 && (business.subscription_active || business.stripe_subscription_id)) {
      if (step === 4) { // Going back from 4
        targetStep = 2; // Skip 3 and go to 2
      } else {
        targetStep = 4; // Going forward from 2, skip to 4
      }
    }

    try {
      await supabase.from('businesses').update({ setup_step: targetStep }).eq('id', business.id);
    } catch (e) {
      console.warn("Could not save setup_step", e);
    }
    setBusiness({ ...business, setup_step: targetStep });
    setStep(targetStep);
  };

  const handleNext = async () => {
    setErrorMsg(null);
    if (!user || !business) return;

    if (step === 1) {
      if (!name || !phone || !address || !city || !postalCode) {
        setErrorMsg('Preencha os campos obrigatórios.');
        return;
      }
      setLoading(true);
      try {
        let slug = business.slug;
        if (slug.startsWith('loja-') && name) {
          slug = await generateUniqueSlug(name);
        }
        const { error } = await supabase.from('businesses').update({
          name, phone, email, address, city, postal_code: postalCode, slug, setup_step: 2
        }).eq('id', business.id);
        
        if (error) {
          if (error.code === '42703' || error.message?.includes('setup_step')) {
            await supabase.from('businesses').update({ name, phone, email, address, city, postal_code: postalCode, slug }).eq('id', business.id);
          } else {
            throw error;
          }
        }
        setBusiness({ ...business, name, phone, email, address, city, postal_code: postalCode, slug, setup_step: 2 });
        setStep(2);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      if (services.length === 0) {
        setErrorMsg('Adicione pelo menos um serviço para prosseguir.');
        return;
      }
      await updateSetupStep(3);
    } else if (step === 3) {
      if (selectedPlan === 'TERMINAL') {
        if (!shippingName || !shippingPhone || !shippingAddress || !shippingCity || !shippingPostalCode) {
          setErrorMsg('Preencha os dados de envio do terminal.');
          return;
        }
      }
      
      setLoading(true);
      try {
        // Save plan choice
        try {
          await supabase.from('businesses').update({ 
            selected_plan: selectedPlan === 'TERMINAL' ? 'app_tablet' : 'app',
            tablet_requested: selectedPlan === 'TERMINAL'
          }).eq('id', business.id);
        } catch(e) {}
        
        if (selectedPlan === 'TERMINAL') {
           await supabase.from('tablet_orders').upsert({
             business_id: business.id,
             shipping_name: shippingName,
             shipping_phone: shippingPhone,
             shipping_address: shippingAddress,
             shipping_city: shippingCity,
             shipping_postal_code: shippingPostalCode,
             status: 'pending'
           }, { onConflict: 'business_id' });
        }

        const res = await fetch('/api/stripe/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId: business.id,
            planName: selectedPlan,
            successUrl: window.location.origin + '/setup/payment-success?session_id={CHECKOUT_SESSION_ID}',
            cancelUrl: window.location.origin + '/partner/setup?status=stripe_cancelled'
          })
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'Failed to create checkout session');
        }
      } catch (e: any) {
        setErrorMsg(e.message);
        setLoading(false);
      }
    } else if (step === 4) {
      await updateSetupStep(5);
    }
  };

  const triggerStripeOnboarding = async () => {
    if (!business) return;
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/connect/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          businessEmail: business.email,
          businessName: business.name
        })
      });
      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create connect session');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  const publishBusiness = async () => {
    if (!business) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('businesses').update({ 
        status: 'active',
        setup_completed: true,
        onboarding_completed_at: new Date().toISOString()
      }).eq('id', business.id);
      
      if (error && error.code !== '42703') {
        throw error;
      } else if (error && error.code === '42703') {
        await supabase.from('businesses').update({ status: 'active' }).eq('id', business.id);
      }
      
      navigate('/partner/dashboard', { replace: true });
    } catch(err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  if (loading && !business) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;
  }

  const steps = [
    { num: 1, title: 'Loja', icon: <Building2 className="w-4 h-4" /> },
    { num: 2, title: 'Serviços', icon: <Scissors className="w-4 h-4" /> },
    { num: 3, title: 'Plano', icon: <CreditCard className="w-4 h-4" /> },
    { num: 4, title: 'Pagamentos', icon: <Landmark className="w-4 h-4" /> },
    { num: 5, title: 'Revisão', icon: <CheckCircle className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Configure a sua Loja</h1>
          <p className="text-sm text-slate-500 mt-2">Complete os passos para ativar o seu estabelecimento na Glamzo.</p>
        </div>

        {/* Error / Success Messages */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-semibold text-center animate-fade-in">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-semibold text-center animate-fade-in">
            {successMsg}
          </div>
        )}

        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-purple-600 -z-10 -translate-y-1/2 rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>
          
          {steps.map(s => (
            <div key={s.num} className={`flex flex-col items-center gap-2 ${step >= s.num ? 'text-purple-600' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step >= s.num ? 'bg-purple-600 border-purple-600 text-white shadow-md' : 'bg-white border-slate-300 text-slate-400'}`}>
                {s.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">{s.title}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Data */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Informações da Loja</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Nome do Estabelecimento *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Ex: Barbearia Central" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Telefone *</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Ex: 910 000 000" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">E-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Ex: ola@barbearia.pt" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Morada Completa *</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Rua, Número, Andar" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Código Postal *</label>
                  <input type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)} className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Ex: 1000-100" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Cidade *</label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Ex: Lisboa" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Services */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Serviços</h2>
            <div className="mb-6 space-y-3">
              {services.map(s => (
                <div key={s.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{s.name}</h4>
                    <p className="text-xs text-slate-500">{s.duration_minutes} min</p>
                  </div>
                  <div className="font-black text-slate-900">{s.price}€</div>
                </div>
              ))}
            </div>

            <div className="p-6 border border-slate-200 rounded-xl bg-slate-50">
              <h4 className="text-sm font-bold text-slate-900 mb-4">Adicionar Serviço</h4>
              <div className="space-y-4">
                <div>
                  <input id="new-svc-name" type="text" placeholder="Nome do Serviço" className="px-3 py-2 border border-slate-300 rounded text-sm w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input id="new-svc-duration" type="number" placeholder="Duração (min)" className="px-3 py-2 border border-slate-300 rounded text-sm w-full" />
                  <input id="new-svc-price" type="number" step="0.01" placeholder="Preço (€)" className="px-3 py-2 border border-slate-300 rounded text-sm w-full" />
                </div>
              </div>
              <button 
                onClick={async () => {
                  const name = (document.getElementById('new-svc-name') as HTMLInputElement).value;
                  const duration = parseInt((document.getElementById('new-svc-duration') as HTMLInputElement).value);
                  const price = parseFloat((document.getElementById('new-svc-price') as HTMLInputElement).value);
                  if (name && duration && price) {
                    const { data, error } = await supabase.from('services').insert({
                      business_id: business.id,
                      name, 
                      duration_minutes: duration, 
                      price, 
                      is_active: true
                    }).select().maybeSingle();
                    
                    if (error) {
                      setErrorMsg('Erro ao adicionar serviço: ' + error.message);
                    } else if (data) {
                      setServices([...services, data]);
                      (document.getElementById('new-svc-name') as HTMLInputElement).value = '';
                      (document.getElementById('new-svc-duration') as HTMLInputElement).value = '';
                      (document.getElementById('new-svc-price') as HTMLInputElement).value = '';
                    }
                  } else {
                     setErrorMsg('Preencha todos os campos do serviço');
                  }
                }}
                className="mt-4 px-4 py-2 bg-purple-600 text-white font-bold text-sm rounded-lg hover:bg-purple-700 w-full"
              >
                Adicionar Serviço
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Plan */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Escolha o seu Plano</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div 
                className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${selectedPlan === 'PRO' ? 'border-purple-600 bg-purple-50/50 shadow-md' : 'border-slate-200 hover:border-purple-300'}`}
                onClick={() => setSelectedPlan('PRO')}
              >
                {selectedPlan === 'PRO' && <div className="absolute top-4 right-4 text-purple-600"><CheckCircle className="w-6 h-6" /></div>}
                <h3 className="text-lg font-bold text-slate-900">Glamzo PRO</h3>
                <div className="my-3"><span className="text-3xl font-black">19,99€</span><span className="text-slate-500 text-sm">/mês</span></div>
                <ul className="space-y-2 mt-4 text-sm text-slate-600">
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> App Gestão Completa</li>
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Marketplace Glamzo</li>
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Website e QR Code</li>
                </ul>
              </div>

              <div 
                className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${selectedPlan === 'TERMINAL' ? 'border-purple-600 bg-purple-50/50 shadow-md' : 'border-slate-200 hover:border-purple-300'}`}
                onClick={() => setSelectedPlan('TERMINAL')}
              >
                <div className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-bl-xl rounded-tr-xl">
                  Recomendado
                </div>
                {selectedPlan === 'TERMINAL' && <div className="absolute top-4 right-4 text-purple-600"><CheckCircle className="w-6 h-6" /></div>}
                <h3 className="text-lg font-bold text-slate-900">PRO Terminal</h3>
                <div className="my-3"><span className="text-3xl font-black">24,99€</span><span className="text-slate-500 text-sm">/mês</span></div>
                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Tudo do plano PRO</li>
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Tablet configurado</li>
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Suporte prioritário</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-slate-200/50 text-xs font-semibold text-slate-500">
                  + Caução única de equipamento: 9,99€
                </div>
              </div>
            </div>

            {selectedPlan === 'TERMINAL' && (
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                <h4 className="font-bold text-slate-900 mb-4">Dados de Envio do Terminal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nome Destinatário" value={shippingName} onChange={e => setShippingName(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input type="text" placeholder="Telefone" value={shippingPhone} onChange={e => setShippingPhone(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input type="text" placeholder="Morada" value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm md:col-span-2" />
                  <input type="text" placeholder="Código Postal" value={shippingPostalCode} onChange={e => setShippingPostalCode(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
                  <input type="text" placeholder="Cidade" value={shippingCity} onChange={e => setShippingCity(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
              </div>
            )}
            
            <p className="text-xs text-slate-500 text-center">Ao avançar, será redirecionado para o Stripe para adicionar o seu cartão e iniciar os seus 14 dias grátis.</p>
          </div>
        )}

        {/* Step 4: Payments (Connect) */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Landmark className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Receber Pagamentos Online</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto text-sm">
              Para aceitar pagamentos com segurança e receber transferências diretamente na sua conta bancária, conecte a sua conta Stripe Connect agora. Pode também saltar este passo e configurar mais tarde.
            </p>
            
            {business?.charges_enabled ? (
               <div className="p-6 border border-emerald-200 bg-emerald-50 rounded-xl max-w-md mx-auto mb-8">
                 <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                 <h3 className="font-bold text-emerald-900">Configuração Concluída</h3>
                 <p className="text-xs text-emerald-700 mt-2">A sua conta bancária está conectada.</p>
               </div>
            ) : (
                <div className="flex flex-col items-center gap-4 mb-8">
                  <button
                    onClick={triggerStripeOnboarding}
                    className="px-8 py-4 bg-[#635BFF] hover:bg-[#5249ea] text-white rounded-xl font-bold uppercase tracking-wider transition-all shadow-lg inline-flex items-center gap-3 w-full max-w-md justify-center"
                  >
                    <span>Conectar Stripe Glamzo Pay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => updateSetupStep(5)} className="text-sm text-slate-500 hover:text-slate-800 underline">
                    Configurar mais tarde
                  </button>
                </div>
            )}
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6 text-center tracking-tight">Tudo Pronto!</h2>
            <div className="max-w-md mx-auto space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 rounded-xl border bg-emerald-50 border-emerald-200">
                  <span className="font-semibold text-sm text-emerald-900">Dados da Loja</span>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-emerald-50 border-emerald-200">
                  <span className="font-semibold text-sm text-emerald-900">Serviços ({services.length})</span>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-emerald-50 border-emerald-200">
                  <span className="font-semibold text-sm text-emerald-900">Plano Subscrito</span>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div className={`flex items-center justify-between p-4 rounded-xl border ${business?.charges_enabled ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                  <span className={`font-semibold text-sm ${business?.charges_enabled ? 'text-emerald-900' : 'text-amber-900'}`}>
                    Pagamentos Online
                  </span>
                  {business?.charges_enabled ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <span className="text-xs text-amber-700 font-bold px-2 py-1 bg-amber-200 rounded">Mais tarde</span>}
                </div>
            </div>

            <div className="text-center">
              <button
                onClick={publishBusiness}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white rounded-xl font-black text-lg uppercase tracking-widest transition-all shadow-xl shadow-purple-900/20 inline-flex items-center gap-3"
              >
                <span>Concluir Setup & Entrar</span>
                <Sparkles className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 5 && (
          <div className="mt-8 flex items-center gap-4">
             {step > 1 && step !== 4 && (
                <button
                  type="button"
                  onClick={() => updateSetupStep(step - 1)}
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2 w-full max-w-[200px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
             )}
            
            {step !== 4 && (
              <button
                type="button"
                disabled={loading}
                onClick={handleNext}
                className="px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md flex items-center justify-center gap-2 flex-1"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>{step === 3 ? 'Assinar Plano' : 'Prosseguir'}</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
