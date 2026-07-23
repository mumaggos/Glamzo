import { useCurrency } from "../../hooks/useCurrency";
import { useTranslation } from "../../hooks/useTranslation";
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Building2, Scissors, CreditCard, Landmark, CheckCircle, ArrowRight, ArrowLeft, Loader2, Sparkles, Check, MapPin, Camera, Upload, Clock, Gift, Trash2, X } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { generateUniqueSlug } from '../../utils/slugify';
import { MAIN_CATEGORIES, SUBCATEGORIES_BY_MAIN } from '../../utils/categoriesData';
import { toast } from 'react-hot-toast';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  "";

const MapUpdater = ({ coordinates }: { coordinates: { lat: number; lng: number } | null }) => {
  const map = useMap();
  useEffect(() => {
    if (map && coordinates) {
      map.panTo(coordinates);
      map.setZoom(16);
    }
  }, [map, coordinates]);
  return null;
};

const POPULAR_SERVICES_BY_CATEGORY: Record<string, { name: string; duration: number; price: number }[]> = {
  'Cabelo & Barbearia': [
    { name: 'Corte de Cabelo Masculino', duration: 30, price: 15 },
    { name: 'Barba Clássica', duration: 20, price: 10 },
    { name: 'Corte + Barba', duration: 45, price: 22 },
    { name: 'Corte de Cabelo Feminino', duration: 45, price: 25 },
    { name: 'Lavagem & Brushing', duration: 30, price: 18 },
    { name: 'Coloração Profissional', duration: 90, price: 40 },
    { name: 'Corte Infantil', duration: 20, price: 12 },
  ],
  'Nails & Beauty': [
    { name: 'Manicure Simples', duration: 30, price: 12 },
    { name: 'Unhas de Gel', duration: 60, price: 25 },
    { name: 'Pedicure Completa', duration: 45, price: 20 },
    { name: 'Nail Art Especial', duration: 30, price: 10 },
    { name: 'Design de Sobrancelhas', duration: 20, price: 8 },
    { name: 'Aplicação de Pestanas', duration: 90, price: 45 },
    { name: 'Maquilhagem Profissional', duration: 60, price: 35 },
  ],
  'Estética': [
    { name: 'Limpeza de Pele Profunda', duration: 60, price: 35 },
    { name: 'Depilação a Cera (Pernas)', duration: 30, price: 15 },
    { name: 'Depilação Laser diodo', duration: 45, price: 30 },
    { name: 'Tratamento Facial Hidratante', duration: 45, price: 40 },
    { name: 'Tratamento Corporal Redutor', duration: 60, price: 45 },
    { name: 'Microagulhamento', duration: 45, price: 50 },
  ],
  'Wellness': [
    { name: 'Massagem Relaxante', duration: 50, price: 30 },
    { name: 'Massagem Terapêutica', duration: 60, price: 40 },
    { name: 'Massagem Desportiva', duration: 50, price: 35 },
    { name: 'Drenagem Linfática', duration: 60, price: 35 },
    { name: 'Sessão de Reflexologia', duration: 30, price: 20 },
    { name: 'Sessão de Reiki', duration: 45, price: 25 },
  ],
  'Ao domicílio': [
    { name: 'Barbeiro ao Domicílio', duration: 45, price: 25 },
    { name: 'Cabeleireiro ao Domicílio', duration: 60, price: 35 },
    { name: 'Manicure ao Domicílio', duration: 45, price: 20 },
    { name: 'Massagem Relaxante ao Domicílio', duration: 60, price: 45 },
  ],
  'Noivas & Eventos': [
    { name: 'Maquilhagem de Noiva', duration: 90, price: 80 },
    { name: 'Penteado de Noiva', duration: 90, price: 80 },
    { name: 'Maquilhagem para Convidados', duration: 45, price: 40 },
    { name: 'Packs de Casamento Completo', duration: 180, price: 250 },
  ],
};

export default function SetupWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');
  
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [salesAgentId, setSalesAgentId] = useState<string | null>(null);

  useEffect(() => {
    const resolveSalesAgent = async () => {
      let storedRef = localStorage.getItem('sales_agent_ref');
      
      // If we have a ref in the URL, prefer it and save it
      if (refCode) {
        storedRef = refCode;
        localStorage.setItem('sales_agent_ref', refCode);
        
        // Also track click if we haven't
        if (!sessionStorage.getItem(`tracked_ref_${refCode}`)) {
          sessionStorage.setItem(`tracked_ref_${refCode}`, 'true');
          try {
             await supabase.rpc('increment_agent_clicks', { agent_ref: refCode });
          } catch (e) {}
        }
      }

      if (storedRef) {
        const { data } = await supabase.from('sales_agents').select('id').eq('ref_code', storedRef).maybeSingle();
        if (data) {
          setSalesAgentId(data.id);
        }
      }
    };
    resolveSalesAgent();
  }, [refCode]);

  // Step 1: Data
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [doorNumber, setDoorNumber] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [category, setCategory] = useState(MAIN_CATEGORIES[0].name);
  const [logoUrl, setLogoUrl] = useState('');
  const [setupByGlamzo, setSetupByGlamzo] = useState(false);
  const DEFAULT_HOURS = [
    { weekday: 1, open_time: '09:00', close_time: '19:00', is_closed: false },
    { weekday: 2, open_time: '09:00', close_time: '19:00', is_closed: false },
    { weekday: 3, open_time: '09:00', close_time: '19:00', is_closed: false },
    { weekday: 4, open_time: '09:00', close_time: '19:00', is_closed: false },
    { weekday: 5, open_time: '09:00', close_time: '19:00', is_closed: false },
    { weekday: 6, open_time: '09:00', close_time: '13:00', is_closed: false },
    { weekday: 0, open_time: '09:00', close_time: '19:00', is_closed: true }
  ];
  const [businessHours, setBusinessHours] = useState(DEFAULT_HOURS);
  
  const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  
  
  useEffect(() => {
    if (loading) return;
    const draft = { step, name, phone, email, address, doorNumber, city, district, postalCode, category, logoUrl, businessHours, setupByGlamzo };
    // localStorage removed
  }, [step, name, phone, email, address, doorNumber, city, district, postalCode, category, logoUrl, businessHours, setupByGlamzo, loading]);

  const handleHourChange = (weekday: number, field: string, value: any) => {
    setBusinessHours(prev => prev.map(h => h.weekday === weekday ? { ...h, [field]: value } : h));
  };
  const [coverUrl, setCoverUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);

  // Auto-geocode debounced
  useEffect(() => {
    if (!address || !city || !postalCode) return;
    const delayDebounceFn = setTimeout(() => {
      triggerGeocoding();
    }, 1500);
    return () => clearTimeout(delayDebounceFn);
  }, [address, doorNumber, city, postalCode]);

  // CORREÇÃO ELITE: Chamada infalível ao Google Maps via REST API para garantir a morada do parceiro
  const triggerGeocoding = async () => {
    if (!address || !city) return;
    try {
      const fullAddress = `${address} ${doorNumber ? doorNumber + ',' : ''} ${postalCode} ${city}, ${district ? district + ',' : ''} Portugal`;
      let lat = null;
      let lng = null;
      
      if (API_KEY) {
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${API_KEY}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          lat = data.results[0].geometry.location.lat;
          lng = data.results[0].geometry.location.lng;
        }
      } else {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`);
        const data = await res.json();
        if (data && data.length > 0) {
          lat = parseFloat(data[0].lat);
          lng = parseFloat(data[0].lon);
        }
      }
      
      if (lat && lng) {
        setCoordinates({ lat, lng });
      }
    } catch (e) {
      console.warn('Geocoding error:', e);
    }
  };

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
    if (!business) return;
    const status = searchParams.get('status');
    const stepParam = searchParams.get('step');
    const checkoutSuccess = searchParams.get('checkout_success');
    const sessionId = searchParams.get('session_id');

    if (!status && !stepParam && !checkoutSuccess && !searchParams.get('checkout_canceled')) return;

    if (checkoutSuccess === 'true') {
      setSuccessMsg('Confirmado! O seu plano foi subscrito com sucesso.');
      setStep(5);
      if (business.setup_step !== 5) {
         supabase.from('businesses').update({ setup_step: 5 }).eq('id', business.id).then();
         business.setup_step = 5;
      }
      if (sessionId) {
         // Verify subscription in background
         fetch("/api/stripe/verify-subscription", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ businessId: business.id, sessionId }),
         }).catch(() => {});
      }
      navigate('/partner/setup', { replace: true });
    } else if (status === 'stripe_cancelled' || searchParams.get('checkout_canceled') === 'true') {
      toast.error('O pagamento não foi concluído ou foi cancelado. Por favor, tente novamente ou escolha outro plano.');
      if (business && business.setup_step === 4) {
         setStep(4);
      }
      navigate('/partner/setup', { replace: true });
    } else if (status === 'connect_success') {
      if (business && business.stripe_account_id) {
        setSuccessMsg('Conta de pagamentos associada com sucesso.');
      }
      if (stepParam) {
         setStep(parseInt(stepParam));
      }
      window.history.replaceState({}, document.title, '/partner/setup');
    } else if (status === 'connect_refresh') {
      setErrorMsg('O processo de configuração de pagamentos foi interrompido.');
      if (stepParam) {
         setStep(parseInt(stepParam));
      }
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
        const slug = await generateUniqueSlug(`loja-${user.id.substring(0, 8)}`);
        const payload: any = {
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
        
        if (salesAgentId) {
          payload.agent_id = salesAgentId;
        }

        
        const { data: newBiz, error: createErr } = await supabase.from('businesses').insert(payload).select().single();
          
        if (!createErr && newBiz && refCode) {
          try {
            // Find referrer
            const { data: referrer } = await supabase.from('profiles').select('id').eq('referral_code', refCode).maybeSingle();
            if (referrer) {
              await supabase.from('affiliate_referrals').insert({
                referrer_id: referrer.id,
                referred_business_id: newBiz.id,
                status: 'pending'
              });
            }
          } catch (e) {
            console.error('Error recording referral:', e);
          }
        }

        if (createErr) {
          if (createErr.code === '23505') {
            const { data: existingBiz } = await supabase.from('businesses').select('*').eq('owner_id', user.id).single();
            currentBiz = existingBiz;
          } else {
             throw createErr;
          }
        } else {
          currentBiz = newBiz;
        }
      }

      if (currentBiz) {
        setBusiness(currentBiz);
        const hasValidSubscription = currentBiz.subscription_active !== false && 
                                     currentBiz.subscription_status !== 'canceled' &&
                                     currentBiz.subscription_status !== 'expired';

        if (currentBiz.status === 'active' && currentBiz.setup_completed && hasValidSubscription) {
          navigate('/partner/dashboard', { replace: true });
          return;
        }
        
        // If they finished setup but their subscription is canceled/expired, force them to the plans step
        if (currentBiz.setup_completed && !hasValidSubscription) {
          setStep(4);
        }
        
        
        const draft: any = null;

        setName(currentBiz.name || draft?.name || '');
        setPhone(currentBiz.phone || draft?.phone || '');
        setEmail(currentBiz.email || draft?.email || '');
        setAddress(currentBiz.address || draft?.address || '');
        setDoorNumber(currentBiz.door_number || draft?.doorNumber || '');
        setCity(currentBiz.city || draft?.city || '');
        setDistrict(currentBiz.district || draft?.district || '');
        setPostalCode(currentBiz.postal_code || draft?.postalCode || '');
        setCategory(currentBiz.category || draft?.category || MAIN_CATEGORIES[0].name);
        setLogoUrl(currentBiz.logo_url || draft?.logoUrl || '');
        setCoverUrl(currentBiz.cover_url || '');

        
        if (currentBiz.latitude && currentBiz.longitude) {
          setCoordinates({ lat: currentBiz.latitude, lng: currentBiz.longitude });
        }
        
        if (draft?.businessHours && draft.businessHours.length > 0) {
          setBusinessHours(draft.businessHours);
        }
        if (draft?.setupByGlamzo !== undefined) {
          setSetupByGlamzo(draft.setupByGlamzo);
        }
        
        const stepParam = searchParams.get('step');
        if (stepParam) {
           const parsedStep = parseInt(stepParam);
           if (!isNaN(parsedStep)) {
              setStep(parsedStep);
              if (currentBiz.setup_step !== parsedStep) {
                 try {
                   await supabase.from('businesses').update({ setup_step: parsedStep }).eq('id', currentBiz.id);
                   currentBiz.setup_step = parsedStep;
                 } catch (e) {}
              }
           }
        } else if (!searchParams.get('status')) {
          let targetStep = currentBiz.setup_step || 1;
          
          if (draft?.step && draft.step > targetStep && draft.step <= 4) {
             targetStep = draft.step;
          }
          
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
    if (targetStep === 3 && (business.subscription_active || business.stripe_subscription_id)) {
      if (step === 4) { 
        targetStep = 2; 
      } else {
        targetStep = 4; 
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

  
  const uploadImage = async (file: File, bucket: string, setter: (url: string) => void) => {
    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
      if (uploadError) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setter(reader.result as string);
        };
        reader.readAsDataURL(file);
        return;
      }
      
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      setter(data.publicUrl);
    } catch (error) {
      console.error('Error uploading image, using base64 fallback:', error);
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleNext = async () => {
    setErrorMsg(null);
    if (!user || !business) return;

    if (step === 1) {
      if (!name || !phone || !address || !city || !postalCode || !district) {
        setErrorMsg('Preencha os campos obrigatórios.');
        return;
      }
      setLoading(true);
      try {
        let lat = coordinates?.lat || null;
        let lng = coordinates?.lng || null;
        
        // Garante que tentamos procurar a latitude novamente no momento exato de guardar caso esteja a null
        if (!lat && API_KEY) {
           try {
             const fullAddress = `${address}, ${postalCode} ${city}, Portugal`;
             const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${API_KEY}`);
             const data = await res.json();
             if (data.results && data.results.length > 0) {
               lat = data.results[0].geometry.location.lat;
               lng = data.results[0].geometry.location.lng;
             }
           } catch(err) { console.warn('Geocoding final falhou', err); }
        }

        let slug = business.slug;
        if (slug.startsWith('loja-') && name) {
          slug = await generateUniqueSlug(name);
        }
        const updateData = {
          name, phone, email, address, door_number: doorNumber || null, city, district: district || city, postal_code: postalCode, slug, setup_step: 2,
          category, logo_url: logoUrl, cover_url: coverUrl,
          latitude: lat, longitude: lng,
          onboarding_step: 2
        };
        const { error } = await supabase.from('businesses').update(updateData).eq('id', business.id);
        
        if (error) {
          if (error.code === '42703' || error.message?.includes('setup_step')) {
            delete (updateData as any).setup_step;
            const { error: retryError } = await supabase.from('businesses').update(updateData).eq('id', business.id);
            if (retryError) throw retryError;
          } else {
            throw error;
          }
        }
        setBusiness({ ...business, ...updateData, setup_step: 2 });
        setStep(2);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    
    } else if (step === 2) {
      setLoading(true);
      setErrorMsg('');
      try {
        if (!business) throw new Error('Business not found');
        
        const hoursToSave = businessHours.map(h => ({
          ...h,
          business_id: business.id
        }));
        
        await supabase.from('business_hours').delete().eq('business_id', business.id);
        const { error: hoursErr } = await supabase.from('business_hours').insert(hoursToSave);
        if (hoursErr) throw hoursErr;
        
        const updateData = { setup_step: 3, onboarding_step: 2 };
        await supabase.from('businesses').update(updateData).eq('id', business.id);
        
        setBusiness({ ...business, ...updateData });
        setStep(3);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }

    } else if (step === 3) {
      if (services.length === 0) {
        setErrorMsg('Adicione pelo menos um serviço para prosseguir.');
        return;
      }
      try {
        const updateData = {
          onboarding_step: 3,
          setup_step: 4,
          manual_setup_requested: business.manual_setup_requested
        };
        await supabase.from('businesses').update(updateData).eq('id', business.id);
        setBusiness({ ...business, ...updateData });
        setStep(4);
      } catch (err) {
        console.warn('Autosave step 3 failed:', err);
      }
    } else if (step === 4) {
      if (selectedPlan === 'TERMINAL') {
        if (!shippingName.trim() || !shippingPhone.trim() || !shippingAddress.trim() || !shippingCity.trim() || !shippingPostalCode.trim()) {
          setErrorMsg('Erro de Validação: Preencha todos os dados de envio do terminal (Nome, Telefone, Morada, Código Postal e Cidade) para continuar.');
          return;
        }
      }
      
      setLoading(true);
      try {
        try {
          await supabase.from('businesses').update({ 
            selected_plan: selectedPlan === 'TERMINAL' ? 'app_tablet' : 'app',
            tablet_requested: selectedPlan === 'TERMINAL'
          }).eq('id', business.id);
        } catch(e) {}
        
        if (selectedPlan === 'TERMINAL') {
           await supabase.from('tablet_orders').upsert({
             business_id: business.id,
             shipping_name: shippingName.trim(),
             shipping_phone: shippingPhone.trim(),
             shipping_address: shippingAddress.trim(),
             shipping_city: shippingCity.trim(),
             shipping_postal_code: shippingPostalCode.trim(),
             status: 'pending'
           }, { onConflict: 'business_id' });
        }

        // Autosave onboarding step as 4
        try {
          await supabase.from('businesses').upsert({
            id: business.id,
            owner_id: user.id,
            name, phone, email, address, door_number: doorNumber || null, city, district: district || city, postal_code: postalCode,
            category, logo_url: logoUrl, cover_url: coverUrl,
            latitude: coordinates?.lat || null, longitude: coordinates?.lng || null,
            onboarding_step: 4, setup_step: 4
          });
        } catch (err) {
          console.warn('Autosave step 3 failed:', err);
        }

        // Check trial_used from database to ensure no trial repetition
        let trialUsed = false;
        try {
          const { data: bRec } = await supabase
            .from('businesses')
            .select('trial_used')
            .eq('id', business.id)
            .maybeSingle();
          if (bRec) {
            trialUsed = bRec.trial_used === true;
          }
        } catch (e) {
          console.warn('Could not read trial_used, fallback to state:', e);
          trialUsed = business?.trial_used === true;
        }

        const res = await fetch('/api/stripe/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId: business.id,
            planName: selectedPlan,
            successUrl: window.location.origin + '/partner/setup?checkout_success=true&session_id={CHECKOUT_SESSION_ID}',
            cancelUrl: window.location.origin + '/partner/setup?checkout_canceled=true',
            force_no_trial: trialUsed
          })
        });

        if (!res.ok) {
          let errorData: any = {};
          try {
            errorData = await res.json();
          } catch (_) {}
          throw new Error(errorData.error || 'Falha ao criar sessão de pagamento no Stripe.');
        }

        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'Não foi possível gerar o link de pagamento Stripe.');
        }
      } catch (e: any) {
        console.error('Checkout setup failed:', e);
        setErrorMsg('Erro no pagamento Stripe: ' + (e.message || 'Falha na subscrição. Por favor, tente novamente.'));
      } finally {
        setLoading(false);
      }
    } else if (step === 5) {
      try {
        await supabase.from('businesses').upsert({
          id: business.id,
          owner_id: user.id,
          name, phone, email, address, door_number: doorNumber || null, city, district: district || city, postal_code: postalCode,
          category, logo_url: logoUrl, cover_url: coverUrl,
          latitude: coordinates?.lat || null, longitude: coordinates?.lng || null,
          onboarding_step: 6, setup_step: 6
        });
      } catch (err) {
        console.warn('Autosave step 4 failed:', err);
      }
      await updateSetupStep(5);
    }
  };

  const handleMagicSetup = async () => {
    if (!user || !business) return;
    if (!name || !phone || !address || !city || !postalCode || !district) {
      setErrorMsg('Preencha os campos obrigatórios (Nome, Telefone, Morada, Código Postal, Cidade, Distrito).');
      return;
    }

    setLoading(true);
    try {
      await supabase.from('businesses').upsert({
        id: business.id,
        owner_id: user.id,
        name, phone, email, address, door_number: doorNumber || null, city, district: district || city, postal_code: postalCode,
        category, logo_url: logoUrl, cover_url: coverUrl,
        latitude: coordinates?.lat || null, longitude: coordinates?.lng || null,
        onboarding_step: 3,
        setup_step: 4,
        manual_setup_requested: true
      });
      setBusiness({ ...business, setup_step: 4 });
      setStep(4);
      toast.success("Excelente escolha! As instruções foram enviadas para o email que configurou no início.", { duration: 5000 });
      
      fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'magic_setup', to: email || user.email, data: { name } })
      }).catch(err => console.warn(err));
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
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
          businessName: business.name,
          returnUrl: window.location.origin + '/partner/setup?status=connect_success&step=5',
          refreshUrl: window.location.origin + '/partner/setup?status=connect_refresh&step=4'
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
      // Query database for latest subscription information
      const { data: latest, error: fetchErr } = await supabase
        .from('businesses')
        .select('subscription_active, stripe_subscription_id, status')
        .eq('id', business.id)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      const hasActiveSub = latest?.subscription_active || latest?.stripe_subscription_id;

      if (!hasActiveSub) {
        // Safe fallback: keep status as 'setup' or 'pending'
        const currentStatus = latest?.status || 'setup';
        const targetStatus = currentStatus === 'active' ? 'setup' : currentStatus;
        
        await supabase.from('businesses').update({
          status: targetStatus,
          public_page_enabled: false
        }).eq('id', business.id);

        setErrorMsg('Erro de Segurança: Não foi encontrada uma subscrição ativa para este espaço. Por favor, assine um plano de subscrição na etapa anterior para que possamos ativar o seu website público.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('businesses').update({ 
        status: 'active',
        public_page_enabled: true,
        setup_completed: true,
        onboarding_completed_at: new Date().toISOString()
      }).eq('id', business.id);
      
      if (error && error.code !== '42703') {
        throw error;
      } else if (error && error.code === '42703') {
        await supabase.from('businesses').update({ status: 'active', public_page_enabled: true }).eq('id', business.id);
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
    { num: 2, title: 'Horários', icon: <Clock className="w-4 h-4" /> },
    { num: 3, title: 'Serviços', icon: <Scissors className="w-4 h-4" /> },
    { num: 4, title: 'Plano', icon: <CreditCard className="w-4 h-4" /> },
    { num: 5, title: 'Pagamentos', icon: <Landmark className="w-4 h-4" /> },
    { num: 6, title: 'Revisão', icon: <CheckCircle className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Configure a sua Loja</h1>
          <p className="text-sm text-slate-500 mt-2">Complete os passos para ativar o seu estabelecimento na Glamzo.</p>
        </div>

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

        <div className="flex justify-between items-center mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-purple-600 -z-10 -translate-y-1/2 rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 5) * 100}%` }}></div>
          
          {steps.map(s => (
            <div key={s.num} className={`flex flex-col items-center gap-2 ${step >= s.num ? 'text-purple-600' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step >= s.num ? 'bg-purple-600 border-purple-600 text-white shadow-md' : 'bg-white border-slate-300 text-slate-400'}`}>
                {s.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">{s.title}</span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Informações da Loja</h2>
            <div className="space-y-4">
              
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Imagens do Estabelecimento (Capa e Perfil)</label>
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 h-44 sm:h-52 flex flex-col justify-end">
                  {coverUrl ? (
                    <img loading="lazy" src={coverUrl} alt="Capa" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-100/50">
                      <Upload className="w-8 h-8 text-slate-300 mb-1" />
                      <span className="text-xs font-medium">Carregar Foto de Capa</span>
                    </div>
                  )}
                  <label className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow flex items-center gap-2 backdrop-blur-sm z-10">
                    <Camera className="w-4 h-4" />
                    <span>Alterar Capa</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(file, 'banners', setCoverUrl);
                      }} 
                    />
                  </label>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="relative w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center group">
                      {logoUrl ? (
                        <img loading="lazy" src={logoUrl} alt="Perfil" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <Building2 className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                      
                      <label className="absolute inset-0 bg-slate-950/65 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="w-5 h-5 text-white" />
                        <span className="text-[9px] font-bold text-white uppercase mt-1">Alterar</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadImage(file, 'logos', setLogoUrl);
                          }} 
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 text-center mt-2">Clique em "Alterar Capa" para o banner superior e passe o rato por cima do círculo central para alterar o seu perfil comercial.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Nome do Estabelecimento *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium" placeholder="Ex: Barbearia Central" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Categoria do Estabelecimento *</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium text-slate-800"
                >
                  {MAIN_CATEGORIES.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">Isso ajuda a interligar e filtrar os seus serviços para que os clientes o encontrem facilmente.</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Morada *</label>
                  <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Ex: Rua Direita" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Nº Porta / Andar</label>
                  <input type="text" value={doorNumber} onChange={e => setDoorNumber(e.target.value)} className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Ex: 12, 1º Esq" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Código Postal *</label>
                  <input type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)} className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Ex: 1000-100" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Cidade *</label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Ex: Lisboa" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Distrito *</label>
                  <input type="text" value={district} onChange={e => setDistrict(e.target.value)} className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="Ex: Lisboa" />
                </div>
              </div>

              {/* Botão escondido pois a geolocalização é automática */}
              <div className="hidden flex justify-end pt-1">
                <button
                  type="button"
                  onClick={triggerGeocoding}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-purple-650" />
                  <span>Encontrar no Mapa 📍</span>
                </button>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Localização Exata no Mapa *</label>
                <p className="text-xs text-slate-500 mb-2.5">Arraste o marcador ou clique no mapa para posicionar o seu estabelecimento com precisão de modo a não haver erro de distância.</p>
                <div className="h-64 rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100 shadow-inner">
                  {API_KEY ? (
                    <APIProvider apiKey={API_KEY}>
                      <Map
                        defaultCenter={coordinates || { lat: 39.3999, lng: -8.2245 }}
                        defaultZoom={coordinates ? 15 : 7}
                        mapId="SETUP_WIZARD_MAP_LOCATION"
                        onClick={(e) => {
                          if (e.detail.latLng) {
                            setCoordinates({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
                          }
                        }}
                        disableDefaultUI
                        style={{ width: '100%', height: '100%' }}
                      >
                        <MapUpdater coordinates={coordinates} />
                        <AdvancedMarker 
                          position={coordinates || { lat: 39.3999, lng: -8.2245 }}
                          draggable
                          onDragEnd={(e) => {
                            if (e.latLng) {
                              setCoordinates({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                            }
                          }}
                        >
                          <div className="relative flex flex-col items-center">
                            <div className="bg-purple-600 text-white p-2 rounded-full shadow-xl border-2 border-white">
                              <MapPin className="w-5 h-5 fill-current" />
                            </div>
                            <div className="absolute top-10 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap opacity-90">
                              Arraste até à sua Loja
                            </div>
                          </div>
                        </AdvancedMarker>
                      </Map>
                    </APIProvider>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <MapPin className="w-8 h-8 text-slate-400 mb-2 animate-pulse" />
                      <span className="text-sm font-bold text-slate-700">Pré-visualização do Mapa</span>
                      <span className="text-xs text-slate-500 mt-1 max-w-xs">Insira a morada correta acima. As coordenadas serão geradas automaticamente ou configuradas no mapa.</span>
                      {coordinates && (
                        <div className="mt-3 text-[10px] font-mono bg-slate-200 text-slate-700 px-2.5 py-1 rounded">
                          Coords: {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className="mt-8 border-t border-slate-200 pt-6">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Gift className="w-24 h-24 text-purple-600" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Gift className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-purple-900">Configuração Mágica (Oferta)</h3>
                  </div>
                  <p className="text-sm text-purple-800 mb-5 max-w-xl">
                    Não quer perder tempo a configurar serviços e horários? Nós tratamos de tudo por si, sem custos adicionais. Preencha apenas os dados acima e clique no botão abaixo.
                  </p>
                  <button
                    type="button"
                    onClick={handleMagicSetup}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-md transition-all uppercase tracking-wider"
                  >
                    <Sparkles className="w-4 h-4" />
                    Quero que a Glamzo configure a loja para mim
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Horários de Funcionamento</h2>
            <p className="text-sm text-slate-500 mb-6">Defina os dias e horas em que a sua loja está aberta. Isto garante que os clientes apenas podem marcar dentro deste horário.</p>
            <div className="space-y-4">
              {WEEKDAYS.map((dayName, idx) => {
                const h = businessHours.find(bh => bh.weekday === idx);
                if (!h) return null;
                return (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3 w-32">
                      <input 
                        type="checkbox" 
                        checked={!h.is_closed}
                        onChange={(e) => handleHourChange(idx, 'is_closed', !e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                      />
                      <span className="font-bold text-sm text-slate-700">{dayName}</span>
                    </div>
                    
                    {!h.is_closed ? (
                      <div className="flex items-center gap-3 flex-1">
                        <input 
                          type="time" 
                          value={h.open_time}
                          onChange={(e) => handleHourChange(idx, 'open_time', e.target.value)}
                          className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                        <span className="text-slate-400 font-bold">até</span>
                        <input 
                          type="time" 
                          value={h.close_time}
                          onChange={(e) => handleHourChange(idx, 'close_time', e.target.value)}
                          className="px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    ) : (
                      <div className="flex-1 text-sm font-bold text-slate-400 px-3 py-2">
                        Fechado
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Serviços</h2>
            <div className="mb-6 space-y-3">
              {services.map(s => (
                <div key={s.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{s.name}</h4>
                    <p className="text-xs text-slate-500">{s.duration_minutes} min</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-black text-slate-900">{s.price}€</div>
                    <button 
                      onClick={async () => {
                        const { error } = await supabase.from('services').delete().eq('id', s.id);
                        if (!error) {
                           setServices(services.filter(svc => svc.id !== s.id));
                        } else {
                           setErrorMsg('Erro ao remover serviço: ' + error.message);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remover serviço"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6 p-5 border border-purple-100 rounded-xl bg-purple-50/20">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Serviços Recomendados ({category})</h4>
              <p className="text-xs text-slate-500 mb-3">Clique para adicionar instantaneamente os serviços mais solicitados:</p>
              <div className="flex flex-wrap gap-2">
                {(POPULAR_SERVICES_BY_CATEGORY[category] || POPULAR_SERVICES_BY_CATEGORY['Cabelo & Barbearia']).map((ps) => {
                  const isAdded = services.some(s => s.name.toLowerCase() === ps.name.toLowerCase());
                  return (
                    <button
                      key={ps.name}
                      type="button"
                      disabled={isAdded}
                      onClick={async () => {
                        const { data, error } = await supabase.from('services').insert({
                          business_id: business.id,
                          name: ps.name, 
                          duration_minutes: ps.duration, 
                          price: ps.price, 
                          is_active: true
                        }).select().maybeSingle();
                        if (!error && data) {
                          setServices([...services, data]);
                        }
                      }}
                      className={`text-xs px-3.5 py-2 rounded-xl border font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isAdded 
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 shadow-sm'
                      }`}
                    >
                      <span>{isAdded ? '✓' : '+'}</span>
                      <span>{ps.name} ({ps.price}€)</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border border-slate-200 rounded-xl bg-slate-50">
              <h4 className="text-sm font-bold text-slate-900 mb-4">Adicionar Serviço</h4>
              <div className="space-y-4">
                <div>
                  <input id="new-svc-name" type="text" placeholder="Nome do Serviço" className="px-3 py-2 border border-slate-300 rounded text-sm w-full" />
                </div>
                <div>
                  <select id="new-svc-cat" className="px-3 py-2 border border-slate-300 rounded text-sm w-full bg-white">
                    <option value="">Selecione o Tipo de Serviço (Opcional)</option>
                    {(SUBCATEGORIES_BY_MAIN[category] || []).map((sub: string) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
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

        {step === 4 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Escolha o seu Plano</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div 
                className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${selectedPlan === 'PRO' ? 'border-purple-600 bg-purple-50/50 shadow-md' : 'border-slate-200 hover:border-purple-300'}`}
                onClick={() => setSelectedPlan('PRO')}
              >
                {selectedPlan === 'PRO' && <div className="absolute top-4 right-4 text-purple-600"><CheckCircle className="w-6 h-6" /></div>}
                <h3 className="text-lg font-bold text-slate-900">Glamzo PRO</h3>
                <div className="my-3"><span className="text-3xl font-black">19,90€</span><span className="text-slate-500 text-sm">/mês</span></div>
                <div className="mb-4">
                  <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">14 Dias Grátis</span>
                </div>
                <ul className="space-y-2 mt-4 text-sm text-slate-600">
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Agenda e Website SEO</li>
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Tap-to-Pay no Telemóvel</li>
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> <strong>Zero taxas (Staff Ilimitado)</strong></li>
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
                <h3 className="text-lg font-bold text-slate-900">Terminal Físico Glamzo</h3>
                <div className="my-3"><span className="text-3xl font-black">99,00€</span><span className="text-slate-500 text-sm"> Único</span></div>
                <div className="mb-4 flex flex-col gap-1">
                  
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded w-max">Portes e Impostos Incluídos</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Sem Mensalidades/Fidelização</li>
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Contactless e Chip</li>
                  <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-emerald-500" /> Integração Direta c/ Agenda</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-slate-200/50 text-xs font-semibold text-slate-500">
                  O terminal é seu para sempre.
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
            
            {selectedPlan === 'PRO' ? (
    <p className="text-xs text-slate-500 text-center">Ao avançar, será redirecionado para o Stripe para adicionar o seu cartão e iniciar os seus 14 dias grátis.</p>
  ) : (
    <p className="text-xs text-slate-500 text-center">Ao avançar, será redirecionado para o Stripe para adicionar o seu cartão e concluir a adesão.</p>
  )}
            
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <button
                type="button"
                onClick={() => updateSetupStep(step - 1)}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleNext}
                className="w-full px-6 py-3.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md flex items-center justify-center gap-2 flex-1"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>{selectedPlan === 'TERMINAL' ? 'Avançar para Pagamento' : 'Iniciar 14 Dias Grátis'}</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Landmark className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Receber Pagamentos Online</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto text-sm">
              Para aceitar pagamentos com segurança e receber transferências diretamente na sua conta bancária, conecte a sua conta Stripe Connect agora. Pode também saltar este passo e configurar mais tarde.
            </p>
            
            {(business?.charges_enabled || business?.stripe_account_id) ? (
               <div className="p-6 border border-emerald-200 bg-emerald-50 rounded-xl max-w-md mx-auto mb-8 flex flex-col items-center">
                 <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                 <h3 className="font-bold text-emerald-900">Configuração Concluída</h3>
                 <p className="text-xs text-emerald-700 mt-2 mb-6">A sua conta bancária está associada.</p>
                 <button
                    onClick={() => updateSetupStep(6)}
                    className="px-8 py-3 bg-[#635BFF] hover:bg-[#5249ea] text-white rounded-xl font-bold uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-3"
                  >
                    <span>Prosseguir</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
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
                  <button onClick={() => updateSetupStep(6)} className="text-sm text-slate-500 hover:text-slate-800 underline">
                    Configurar mais tarde
                  </button>
                </div>
            )}
          </div>
        )}

        {step === 6 && (
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

        {step < 6 && (
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
