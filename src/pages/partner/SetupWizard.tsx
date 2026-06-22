import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { 
  Building2, Scissors, Users, CreditCard, Landmark, CheckCircle, 
  ArrowRight, ArrowLeft, Loader2, Sparkles, Check, Store, MapPin, 
  Phone, Mail, Lock
} from 'lucide-react';
import { optimizeImageBeforeUpload } from '../../utils/imageOptimizer';
import { slugify, generateUniqueSlug } from '../../utils/slugify';
import { getCoordinatesForCity } from '../../utils/geoData';

export default function SetupWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Step 1 states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // Step 2 & 3 lists
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  // Step 4 states
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
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    if (status === 'stripe_success') {
      setSuccessMsg('Subscrição ativada com sucesso!');
      setStep(6);
      window.history.replaceState({}, document.title, '/setup');
    } else if (status === 'stripe_cancelled') {
      setErrorMsg('Pagamento cancelado ou não concluído.');
      window.history.replaceState({}, document.title, '/setup');
    }
  }, []);

  const fetchBusiness = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      let biz = data;
      
      if (!biz) {
        // Create initial placeholder business idempotently
        console.log('[PartnerSetup] Nenhuma loja encontrada. A inicializar business para o dono...');
        const slug = await generateUniqueSlug(`loja-${user.id.substring(0, 8)}`);
        const payload = {
          owner_id: user.id,
          name: '',
          email: user.email || '',
          phone: '',
          address: '',
          city: '',
          postal_code: '',
          status: 'setup',
          slug: slug,
          category: 'Cabelo & Barbearia' // Default
        };
        
        const { data: newBiz, error: createErr } = await supabase
          .from('businesses')
          .insert(payload)
          .select()
          .single();
          
        if (createErr) {
          // If concurrent insert happened (duplicate key mapping on owner_id unicity or slug)
          if (createErr.code === '23505') {
            const { data: existingBiz } = await supabase.from('businesses').select('*').eq('owner_id', user.id).single();
            biz = existingBiz;
          } else if (createErr.code === '42703' || createErr.message?.includes('column')) {
            // column fallback
            console.warn('Handling missing columns for business insert');
            const fallbackPayload = { ...payload };
            delete (fallbackPayload as any).status;
            const { data: fbBiz, error: fbErr } = await supabase.from('businesses').insert(fallbackPayload).select().single();
            if (fbErr) {
              console.error('[PartnerSetup] Fallback insert failed:', fbErr);
              throw fbErr;
            }
            biz = fbBiz;
          } else {
             throw createErr;
          }
        } else {
          biz = newBiz;
        }
      }

      if (biz) {
        console.log('[PartnerSetup] business encontrado status=', biz.status);
        setBusiness(biz);
        
        let isBusinessActive = biz.status === 'active';
        if (biz.status === undefined && biz.name && biz.name.trim() !== '') {
          isBusinessActive = true;
        }

        if (isBusinessActive) {
          console.log('[PartnerSetup] Loja já ativa, redirect => /dashboard');
          navigate('/dashboard', { replace: true });
          return;
        }
        
        setName(biz.name || '');
        setPhone(biz.phone || '');
        setEmail(biz.email || '');
        setAddress(biz.address || '');
        setCity(biz.city || '');
        setPostalCode(biz.postal_code || '');
        setLogoUrl(biz.logo_url || '');
        setCoverUrl(biz.cover_url || '');

        // Preload services
        const { data: svcs } = await supabase.from('services').select('*').eq('business_id', biz.id);
        if (svcs) setServices(svcs);
        
        // Preload staff
        const { data: stfs } = await supabase.from('staff').select('*').eq('business_id', biz.id);
        if (stfs) setStaff(stfs);
        
        // Preload order if terminal
        const { data: order } = await supabase.from('tablet_orders').select('*').eq('business_id', biz.id).maybeSingle();
        if (order) {
          setSelectedPlan('TERMINAL');
          setShippingName(order.shipping_name);
          setShippingPhone(order.shipping_phone);
          setShippingAddress(order.shipping_address);
          setShippingPostalCode(order.shipping_postal_code);
          setShippingCity(order.shipping_city);
        }
      }
    } catch (err: any) {
      console.error('[PartnerSetup] Erro ao carregar/criar loja:', err);
      setErrorMsg('Erro ao preparar a configuração da loja: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    setErrorMsg(null);
    if (!user) return;

    if (step === 1) {
      if (!name || !phone || !address || !city || !postalCode) {
        setErrorMsg('Preencha os campos obrigatórios.');
        return;
      }
      if (!business) {
        setErrorMsg('Erro interno: a loja não foi inicializada corretamente. Atualize a página e tente novamente.');
        return;
      }
      
      setLoading(true);
      
      try {
        let slug = business.slug;
        // Se a entidade tinha slug temporario ('loja-xyz') e agora tem nome, cria um slug a sério
        if (slug.startsWith('loja-') && name) {
          slug = await generateUniqueSlug(name);
        }

        const { error } = await supabase.from('businesses').update({
          name, phone, email, address, city, postal_code: postalCode, logo_url: logoUrl, cover_url: coverUrl, slug
        }).eq('id', business.id);
        
        if (error) throw error;
        
        setBusiness({ ...business, name, phone, email, address, city, postal_code: postalCode, logo_url: logoUrl, cover_url: coverUrl, slug });
        setStep(2);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      if (!business) return;
      if (services.length === 0) {
        setErrorMsg('Adicione pelo menos um serviço para prosseguir.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!business) return;
      if (staff.length === 0) {
        setErrorMsg('Adicione pelo menos um profissional para prosseguir.');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (selectedPlan === 'TERMINAL') {
        if (!shippingName || !shippingPhone || !shippingAddress || !shippingCity || !shippingPostalCode) {
          setErrorMsg('Preencha os dados de envio do terminal.');
          return;
        }
        setLoading(true);
        // Upsert order
        const orderData = {
          business_id: business.id,
          shipping_name: shippingName,
          shipping_phone: shippingPhone,
          shipping_address: shippingAddress,
          shipping_city: shippingCity,
          shipping_postal_code: shippingPostalCode,
          deposit_amount: 9.99,
          deposit_paid: false,
          status: 'pending'
        };
        const { error } = await supabase.from('tablet_orders').upsert(orderData, { onConflict: 'business_id' });
        setLoading(false);
        if (error) return setErrorMsg(error.message);
      } else {
        // Delete order if changed mind to PRO
        await supabase.from('tablet_orders').delete().eq('business_id', business.id);
      }
      setStep(5);
    } else if (step === 5) {
      // Logic for step 5 done asynchronously inside the component or just simulated bypass for now
      setStep(6);
    } else if (step === 6) {
      // Must be connected
      if (!business.charges_enabled) {
        setErrorMsg('Ainda não configurou os pagamentos.');
        return;
      }
      setStep(7);
    }
  };

  const publishBusiness = async () => {
    if (!business) return;
    setLoading(true);
    let { error } = await supabase.from('businesses').update({ status: 'active' }).eq('id', business.id);
    setLoading(false);
    if (error) {
      if (error.code === '42703' || error.message?.includes('status')) {
        console.warn('Status column missing, bypassing active mark and redirecting.');
      } else {
        setErrorMsg(error.message);
        return;
      }
    }
    navigate('/dashboard');
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'cover') => {
    if (!user || !business) return;
    
    // Check bypass dummy mode
    if (localStorage.getItem('glamzo_bypass_supabase') === 'true') {
      const url = URL.createObjectURL(file);
      if (type === 'logo') setLogoUrl(url);
      else setCoverUrl(url);
      return;
    }
    
    const setUploading = type === 'logo' ? setUploadingLogo : setUploadingCover;
    setUploading(true);
    try {
      const optimized = await optimizeImageBeforeUpload(file, type === 'logo' ? 400 : 1200);
      const ext = optimized.fileName.split('.').pop();
      const filename = `${business.id}_${Date.now()}_${type}.${ext}`;
      const { data, error } = await supabase.storage.from('avatars').upload(filename, optimized.blob);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filename);
      
      if (type === 'logo') setLogoUrl(publicUrl);
      else setCoverUrl(publicUrl);
      
      await supabase.from('businesses').update({ [type === 'logo' ? 'logo_url' : 'cover_url']: publicUrl }).eq('id', business.id);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setUploading(false);
    }
  };

  const triggerStripeOnboarding = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/create-account-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.id })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create connect link');
      }
    } catch (e: any) {
      alert(e.message);
      setLoading(false);
    }
  };

  if (loading && !business) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;
  }

  const checklist = [
    { title: 'Perfil', done: !!name && !!phone },
    { title: 'Serviços', done: services.length > 0 },
    { title: 'Funcionários', done: staff.length > 0 },
    { title: 'Plano Ativo', done: business?.subscription_active || false },
    { title: 'Recebimentos Stripe', done: business?.charges_enabled || false }
  ];

  if (loading && !business) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-xs font-bold font-mono tracking-widest text-slate-500 uppercase">A preparar a sua área...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-purple-200 selection:text-purple-900 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h1 className="font-bold text-slate-900 uppercase tracking-wider text-sm">Glamzo Onboarding</h1>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Passo {step} de 7
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-purple-600 transition-all duration-300" style={{ width: `${(step / 7) * 100}%` }} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-10 px-4 sm:px-6">
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
            {successMsg}
          </div>
        )}

        {/* Step 1: Perfil */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Perfil da Empresa</h2>
            <p className="text-sm text-slate-500 mb-6 bg-purple-50 p-3 rounded-lg border border-purple-100 font-medium">
              ✨ Preencha os dados que serão apresentados aos clientes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Nome da Loja *</label>
                  <div className="relative rounded-xl shadow-sm">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600"><Store className="w-4 h-4" /></span>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Telefone *</label>
                  <div className="relative rounded-xl shadow-sm">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600"><Phone className="w-4 h-4" /></span>
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email</label>
                  <div className="relative rounded-xl shadow-sm">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600"><Mail className="w-4 h-4" /></span>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Morada *</label>
                  <div className="relative rounded-xl shadow-sm">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600"><MapPin className="w-4 h-4" /></span>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Cidade *</label>
                    <input type="text" value={city} onChange={e => setCity(e.target.value)} className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">C. Postal *</label>
                    <input type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)} className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Logótipo e Capa</label>
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 relative overflow-hidden flex items-center justify-center bg-slate-50">
                      {logoUrl ? <img src={logoUrl} className="w-full h-full object-cover" /> : <span className="text-xs text-slate-400">Logo</span>}
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => e.target.files && handleImageUpload(e.target.files[0], 'logo')} />
                      {uploadingLogo && <div className="absolute inset-0 bg-white/50 flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin text-purple-600"/></div>}
                    </div>
                    <div className="flex-1 h-20 rounded-xl border-2 border-dashed border-slate-300 relative overflow-hidden flex items-center justify-center bg-slate-50">
                      {coverUrl ? <img src={coverUrl} className="w-full h-full object-cover" /> : <span className="text-xs text-slate-400">Capa</span>}
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => e.target.files && handleImageUpload(e.target.files[0], 'cover')} />
                      {uploadingCover && <div className="absolute inset-0 bg-white/50 flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin text-purple-600"/></div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Serviços */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Serviços</h2>
            <p className="text-sm text-slate-500 mb-6 bg-purple-50 p-3 rounded-lg border border-purple-100 font-medium">
              ✨ Adicione os serviços que pretende disponibilizar para reserva online.
            </p>
            
            <div className="space-y-4">
              {services.map(s => (
                <div key={s.id} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">{s.name}</h3>
                    <p className="text-xs text-slate-500">{s.duration_minutes} min • {s.price}€</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
              ))}
              
              <div className="p-6 border border-slate-200 rounded-xl bg-slate-50">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Adicionar Novo Serviço</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input id="new-service-name" type="text" placeholder="Nome (ex: Corte)" className="px-3 py-2 border border-slate-300 rounded text-sm w-full" />
                  <input id="new-service-price" type="number" placeholder="Preço (€)" className="px-3 py-2 border border-slate-300 rounded text-sm w-full" />
                  <input id="new-service-duration" type="number" placeholder="Duração (min)" className="px-3 py-2 border border-slate-300 rounded text-sm w-full" />
                </div>
                <button 
                  onClick={() => {
                    const name = (document.getElementById('new-service-name') as HTMLInputElement).value;
                    const price = parseFloat((document.getElementById('new-service-price') as HTMLInputElement).value);
                    const duration = parseInt((document.getElementById('new-service-duration') as HTMLInputElement).value);
                    
                    if (name && !isNaN(price) && !isNaN(duration)) {
                      supabase.from('services').insert({
                        business_id: business.id,
                        name, price, duration_minutes: duration, is_active: true
                      }).select().maybeSingle().then(({ data }) => {
                        if (data) {
                          setServices([...services, data]);
                          (document.getElementById('new-service-name') as HTMLInputElement).value = '';
                          (document.getElementById('new-service-price') as HTMLInputElement).value = '';
                          (document.getElementById('new-service-duration') as HTMLInputElement).value = '';
                        }
                      });
                    } else {
                      alert('Por favor, preencha todos os campos corretamente.');
                    }
                  }}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white font-bold text-sm rounded-lg hover:bg-purple-700 w-full"
                >
                  Confirmar e Adicionar Serviço
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Funcionários */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Funcionários</h2>
            <p className="text-sm text-slate-500 mb-6 bg-purple-50 p-3 rounded-lg border border-purple-100 font-medium">
              ✨ Associe cada profissional aos respetivos serviços.
            </p>

            <div className="space-y-4">
              {staff.map(s => (
                <div key={s.id} className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                      {s.avatar_url ? <img src={s.avatar_url} className="w-full h-full rounded-full object-cover" /> : <Users className="w-5 h-5 text-slate-500" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{s.full_name}</h3>
                      <p className="text-xs text-slate-500">{s.role_title || 'Membro'}</p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
              ))}

              <div className="p-6 border border-slate-200 rounded-xl bg-slate-50">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Adicionar Funcionário</h4>
                <input id="new-staff-name" type="text" placeholder="Nome (ex: Maria Joana)" className="px-3 py-2 border border-slate-300 rounded text-sm w-full" />
                <button 
                  onClick={() => {
                    const full_name = (document.getElementById('new-staff-name') as HTMLInputElement).value;
                    if (full_name) {
                      supabase.from('staff').insert({
                        business_id: business.id,
                        full_name, is_active: true
                      }).select().maybeSingle().then(({ data }) => {
                        if (data) {
                          setStaff([...staff, data]);
                          (document.getElementById('new-staff-name') as HTMLInputElement).value = '';
                        }
                      });
                    }
                  }}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white font-bold text-sm rounded-lg hover:bg-purple-700 w-full"
                >
                  Confirmar e Adicionar Funcionário
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Plano */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Escolha o seu Plano</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* PRO */}
              <div 
                className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${selectedPlan === 'PRO' ? 'border-purple-600 bg-purple-50/50 shadow-md' : 'border-slate-200 hover:border-purple-300'}`}
                onClick={() => setSelectedPlan('PRO')}
              >
                {selectedPlan === 'PRO' && <div className="absolute top-4 right-4 text-purple-600"><CheckCircle className="w-6 h-6" /></div>}
                <h3 className="text-lg font-bold text-slate-900">Glamzo PRO</h3>
                <div className="my-3"><span className="text-3xl font-black">19,99€</span><span className="text-slate-500 text-sm">/mês</span></div>
                <ul className="space-y-2 mt-4 text-sm text-slate-600">
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Agenda online</li>
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Marketplace Glamzo</li>
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Reservas online</li>
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Stripe Connect</li>
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Website e QR Code</li>
                </ul>
              </div>

              {/* TERMINAL */}
              <div 
                className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${selectedPlan === 'TERMINAL' ? 'border-purple-600 bg-purple-50/50 shadow-md' : 'border-slate-200 hover:border-purple-300'}`}
                onClick={() => setSelectedPlan('TERMINAL')}
              >
                <div className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-bl-xl rounded-tr-xl">
                  Recomendado
                </div>
                {selectedPlan === 'TERMINAL' && <div className="absolute top-4 right-4 text-purple-600"><CheckCircle className="w-6 h-6" /></div>}
                <h3 className="text-lg font-bold text-slate-900">Glamzo PRO Terminal</h3>
                <div className="my-3"><span className="text-3xl font-black">24,99€</span><span className="text-slate-500 text-sm">/mês</span></div>
                <div className="text-xs bg-slate-100 p-2 rounded text-slate-600 mb-4 inline-block font-semibold">Tudo do plano PRO, mais:</div>
                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Tablet configurado pela Glamzo</li>
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> App instalada e pronta a usar</li>
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Suporte prioritário</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-slate-200/50 text-xs font-semibold text-slate-500">
                  + Caução única de equipamento: 9,99€ (reembolsável no final)
                </div>
              </div>
            </div>

            {selectedPlan === 'TERMINAL' && (
              <div className="animate-fade-in bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Building2 className="w-5 h-5 text-purple-600" /> Dados de Envio do Terminal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Destinatário</label>
                    <input type="text" value={shippingName} onChange={e => setShippingName(e.target.value)} className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Telefone Contacto</label>
                    <input type="text" value={shippingPhone} onChange={e => setShippingPhone(e.target.value)} className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Morada Completa</label>
                    <input type="text" value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Código Postal</label>
                    <input type="text" value={shippingPostalCode} onChange={e => setShippingPostalCode(e.target.value)} className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Cidade</label>
                    <input type="text" value={shippingCity} onChange={e => setShippingCity(e.target.value)} className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Stripe Checkout (Simulated/Action) */}
        {step === 5 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in text-center">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Ativar Subscrição {selectedPlan}</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {business.trial_used ? 
                `Como já usufruiu da oferta de 14 dias grátis anteriormente, o ciclo de faturação de ${selectedPlan === 'TERMINAL' ? '24,99€' : '19,99€'}/mês iniciará agora.` 
                : 
                `Ao ativar, irá iniciar os seus 14 dias gratuitos. A primeira caução de 19,99€ ou 24,99€ só começará após o período terminar.`}
              {selectedPlan === 'TERMINAL' && <><br/><br/><strong>Atenção:</strong> Será cobrado agora a caução única refunda no valor de 9,99€ pelo envio imediato do Terminal.</>}
            </p>
            
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await fetch('/api/stripe/create-subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      businessId: business.id,
                      planName: selectedPlan,
                      successUrl: window.location.origin + '/setup?status=stripe_success',
                      cancelUrl: window.location.origin + '/setup?status=stripe_cancelled'
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
              }}
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold uppercase tracking-wider transition-all shadow-lg inline-flex items-center gap-3"
            >
              <span>{business.trial_used ? 'Realizar Pagamento Seguro' : 'Iniciar 14 Dias Grátis & Ativar'}</span>
              <Lock className="w-4 h-4" />
            </button>
            <div className="mt-4 text-xs text-slate-400">Processamento Seguro via Stripe</div>
          </div>
        )}

        {/* Step 6: Stripe Connect */}
        {step === 6 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Landmark className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Receber Pagamentos</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Para aceitar pagamentos com segurança na plataforma e receber transferências diretamente na sua conta bancária, conecte ou inicie a sua conta Stripe.
            </p>
            
            {business?.charges_enabled ? (
               <div className="p-6 border border-emerald-200 bg-emerald-50 rounded-xl max-w-md mx-auto mb-8">
                 <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                 <h3 className="font-bold text-emerald-900">Configuração Concluída</h3>
                 <p className="text-xs text-emerald-700 mt-2">A sua conta bancária está conetada e pronta para receber reservas dos clientes.</p>
               </div>
            ) : (
                <button
                  onClick={triggerStripeOnboarding}
                  className="px-8 py-4 bg-[#635BFF] hover:bg-[#5249ea] text-white rounded-xl font-bold uppercase tracking-wider transition-all shadow-lg inline-flex items-center gap-3 mb-8"
                >
                  <span>Conectar Stripe Glamzo Pay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
            )}

            <div className="flex gap-4 justify-center">
              <button onClick={() => { fetchBusiness(); }} className="text-sm font-semibold text-slate-500 underline">Atualizar estado</button>
            </div>
          </div>
        )}

        {/* Step 7: Final Checklist & Publish */}
        {step === 7 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6 text-center tracking-tight">Tudo Pronto para Arrasar!</h2>
            
            <div className="max-w-md mx-auto space-y-3 mb-8">
              {checklist.map((item, i) => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${item.done ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                  <span className={`font-semibold text-sm ${item.done ? 'text-emerald-900' : 'text-rose-900'}`}>{item.title}</span>
                  {item.done ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Loader2 className="w-5 h-5 text-rose-500 animate-spin" />}
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                disabled={!checklist.every(c => c.done)}
                onClick={publishBusiness}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-black text-lg uppercase tracking-widest transition-all shadow-xl shadow-purple-900/20 disabled:opacity-50 disabled:grayscale inline-flex items-center gap-3"
              >
                <span>Entrar Online</span>
                <Sparkles className="w-6 h-6" />
              </button>
              {!checklist.every(c => c.done) && <p className="text-xs text-rose-500 mt-4 font-bold">Conclua todas as etapas obrigatórias para publicar o seu negócio.</p>}
            </div>
          </div>
        )}

        {/* Navigation actions - only for step 1 to 6 */}
        {step < 7 && (
          <div className="mt-8 flex items-center gap-4">
             {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2 w-full max-w-[200px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
             )}
            
            <button
              type="button"
              disabled={loading}
              onClick={handleNext}
              className="px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 flex-1 relative"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Prosseguir</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
