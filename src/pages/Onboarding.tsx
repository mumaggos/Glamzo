import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { slugify, generateUniqueSlug } from '../utils/slugify';
import { PORTUGAL_GEO, getCoordinatesForCity } from '../utils/geoData';
import { optimizeImageBeforeUpload } from '../utils/imageOptimizer';
import { 
  Building2, ArrowLeft, ArrowRight, Check, Store, Sparkles, 
  MapPin, Phone, Globe, Image as ImageIcon, FileText, Loader2, Compass, Map as MapIcon,
  CreditCard, Clock, Scissors, Users, User, Tablet
} from 'lucide-react';

const DRAFT_KEY = 'wizard_v1.5_draft';

const defaultDraft = {
  step1: { name: '', category: 'Cabelo & Barbearia', type: '', description: '', languages: [], phone: '', website: '' },
  step2: { country: 'Portugal', district: 'Lisboa', city: 'Lisboa', postalCode: '', address: '', doorNumber: '' },
  step3: { logoUrl: '', coverUrl: '', gallery: [] },
  step4: { hours: [] },
  step5: { services: [] },
  step6: { staff: [] },
  step7: { plan: 'PRO' }, // PRO, PRO_TERMINAL
  step8: { onlinePayments: true }
};

export default function Onboarding() {
    const { t } = useTranslation();
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 9;

  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Storage
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from('businesses').select('id, setup_completed').eq('owner_id', user.id).maybeSingle().then(({ data }) => {
        if (data?.setup_completed) {
          navigate('/partner/dashboard', { replace: true });
        } else {
          const saved = localStorage.getItem(DRAFT_KEY);
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setDraft(parsed.draft || defaultDraft);
              setCurrentStep(parsed.step || 1);
            } catch {
              setDraft(defaultDraft);
            }
          } else {
            setDraft(defaultDraft);
          }
          setLoading(false);
        }
      });
    } else {
      // If not user, wait or redirect to login
      const timer = setTimeout(() => {
        if (!user) navigate('/partner/login', { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  useEffect(() => {
    if (draft) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ draft, step: currentStep }));
    }
  }, [draft, currentStep]);

  const updateDraft = (stepKey: string, field: string, value: any) => {
    setDraft((prev: any) => ({
      ...prev,
      [stepKey]: {
        ...prev[stepKey],
        [field]: value
      }
    }));
  };

  const handleNext = () => {
    setErrorMsg(null);
    if (currentStep === 1 && !draft.step1.name.trim()) { setErrorMsg('Nome da loja é obrigatório.'); return; }
    if (currentStep === 2 && !draft.step2.address.trim()) { setErrorMsg('Morada é obrigatória.'); return; }
    
    if (currentStep < totalSteps) {
      setCurrentStep(c => c + 1);
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (currentStep > 1) {
      setCurrentStep(c => c - 1);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    type === 'logo' ? setUploadingLogo(true) : setUploadingCover(true);
    setErrorMsg(null);
    try {
      const optimized = await optimizeImageBeforeUpload(file);
      const filePath = `businesses/${user.id}-${type}-${Date.now()}.webp`;
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(filePath, optimized.blob, { contentType: 'image/webp', upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      updateDraft('step3', type === 'logo' ? 'logoUrl' : 'coverUrl', publicUrl);
    } catch (err: any) {
      setErrorMsg('Falha ao enviar imagem.');
    } finally {
      type === 'logo' ? setUploadingLogo(false) : setUploadingCover(false);
    }
  };

  const submitAll = async () => {
    if (!user) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const businessSlug = await generateUniqueSlug(draft.step1.name);
      // Attempt to geocode the precise address first!
      let latitude: number | null = null;
      let longitude: number | null = null;
      const fullAddress = `${draft.step2.address}, ${draft.step2.doorNumber || ''} ${draft.step2.postalCode || ''} ${draft.step2.city}, Portugal`;

      // 1. Try Google Maps Geocoder if loaded
      if (window.google?.maps) {
        try {
          const geocoder = new window.google.maps.Geocoder();
          const result = await new Promise<any>((resolve, reject) => {
            geocoder.geocode({ address: fullAddress }, (results, status) => {
              if (status === 'OK' && results?.[0]) resolve(results[0]);
              else reject(new Error('Geocoding failed'));
            });
          });
          latitude = result.geometry.location.lat();
          longitude = result.geometry.location.lng();
        } catch (err) {
          console.warn('Google geocoding in onboarding failed:', err);
        }
      }

      // 2. Try Nominatim (OSM) as fallback
      if (latitude === null || longitude === null) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`);
          const data = await res.json();
          if (data && data.length > 0) {
            latitude = parseFloat(data[0].lat);
            longitude = parseFloat(data[0].lon);
          }
        } catch (err) {
          console.warn('Nominatim geocoding in onboarding failed:', err);
        }
      }

      // 3. Last fallback: getCoordinatesForCity
      if (latitude === null || longitude === null) {
        const cityCoords = getCoordinatesForCity(draft.step2.district, draft.step2.city);
        latitude = cityCoords.latitude;
        longitude = cityCoords.longitude;
      }

      const businessPayload = {
        owner_id: user.id,
        name: draft.step1.name,
        slug: businessSlug,
        description: draft.step1.description || null,
        category: draft.step1.category || 'Cabelo & Barbearia',
        phone: draft.step1.phone,
        website: draft.step1.website || null,
        district: draft.step2.district,
        city: draft.step2.city,
        address: draft.step2.address,
        postal_code: draft.step2.postalCode || null,
        door_number: draft.step2.doorNumber || null,
        latitude,
        longitude,
        logo_url: draft.step3.logoUrl || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=150&h=150&q=70',
        cover_url: draft.step3.coverUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&h=400&q=75',
        status: 'active',
        setup_completed: true,
        is_verified: false,
        subscription_status: 'trialing'
      };

      // 1. Insert Business
      let { data: bData, error: insertError } = await supabase.from('businesses').insert(businessPayload).select('id').single();
      
      if (insertError) {
        throw insertError;
      }
      
      const bId = bData?.id;

      // 2. Insert Services if any (mocking basic insert)
      if (bId && draft.step5.services.length > 0) {
        const srvPayloads = draft.step5.services.map((s: any) => ({
          business_id: bId,
          name: s.name,
          price: parseFloat(s.price) || 0,
          duration_minutes: parseInt(s.duration) || 30,
          is_active: true
        }));
        await supabase.from('services').insert(srvPayloads);
      }

      // 3. Update Profile role
      await supabase.from('profiles').update({ role: 'business' }).eq('id', user.id);
      
      // Clear draft
      localStorage.removeItem(DRAFT_KEY);
      await refreshProfile();
      navigate('/partner/dashboard', { replace: true });

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao guardar dados. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !draft) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-black text-slate-900 mb-4">{t('txt_passo_1_dados_da_loja') || 'Passo 1: Dados da Loja'}</h2>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('txt_nome_comercial') || 'Nome Comercial *'}</label>
              <input type="text" value={draft.step1.name} onChange={e => updateDraft('step1', 'name', e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-purple-500" placeholder={t('txt_ex_glamour_spa') || 'Ex: Glamour Spa'} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('txt_categoria_129') || 'Categoria'}</label>
                <select value={draft.step1.category} onChange={e => updateDraft('step1', 'category', e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm">
                  <option value="Cabelo & Barbearia">{t('txt_cabelo_barbearia') || 'Cabelo & Barbearia'}</option>
                  <option value="Nails & Beauty">{t('txt_nails_beauty') || 'Nails & Beauty'}</option>
                  <option value="Estética">{t('txt_est_tica') || 'Estética'}</option>
                  <option value="Bem-Estar">{t('txt_bem_estar_130') || 'Bem-Estar'}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('txt_telefone') || 'Telefone *'}</label>
                <input type="text" value={draft.step1.phone} onChange={e => updateDraft('step1', 'phone', e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm" placeholder={t('txt_ex_912_345_678') || 'Ex: 912 345 678'} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('txt_descri_o') || 'Descrição'}</label>
              <textarea value={draft.step1.description} onChange={e => updateDraft('step1', 'description', e.target.value)} rows={3} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm" placeholder={t('txt_apresente_o_seu_espa_o') || 'Apresente o seu espaço...'} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-black text-slate-900 mb-4">{t('txt_passo_2_morada_exata_para_o_ma') || 'Passo 2: Morada Exata (Para o Mapa)'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('txt_distrito') || 'Distrito *'}</label>
                <select value={draft.step2.district} onChange={e => { updateDraft('step2', 'district', e.target.value); updateDraft('step2', 'city', PORTUGAL_GEO[e.target.value]?.[0] || ''); }} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm">
                  {Object.keys(PORTUGAL_GEO).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('txt_concelho_cidade') || 'Concelho / Cidade *'}</label>
                <select value={draft.step2.city} onChange={e => updateDraft('step2', 'city', e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm">
                  {(PORTUGAL_GEO[draft.step2.district] || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('txt_morada_rua_avenida') || 'Morada (Rua/Avenida) *'}</label>
              <input type="text" value={draft.step2.address} onChange={e => updateDraft('step2', 'address', e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm" placeholder={t('txt_rua_de_exemplo') || 'Rua de Exemplo'} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('txt_n_mero') || 'Número *'}</label>
                <input type="text" value={draft.step2.doorNumber} onChange={e => updateDraft('step2', 'doorNumber', e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm" placeholder="123" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t('txt_c_digo_postal') || 'Código Postal *'}</label>
                <input type="text" value={draft.step2.postalCode} onChange={e => updateDraft('step2', 'postalCode', e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm" placeholder={t('txt_1000_100_133') || '1000-100'} />
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start gap-2">
              <MapIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">{t('txt_esta_morada_ser_usada_para_col') || 'Esta morada será usada para colocar o seu estabelecimento no mapa e nas pesquisas de clientes próximos de si.'}</p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-black text-slate-900 mb-4">{t('txt_passo_3_imagens') || 'Passo 3: Imagens'}</h2>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <div><h4 className="text-sm font-bold text-slate-800">{t('txt_logo_da_loja') || 'Logo da Loja'}</h4><p className="text-xs text-slate-500">{t('txt_propor_o_1_1') || 'Proporção 1:1'}</p></div>
              <label className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer">
                {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Carregar'}
                <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'logo')} />
              </label>
            </div>
            {draft.step3.logoUrl && <img loading="lazy" src={draft.step3.logoUrl} alt={t('txt_logo_134') || 'Logo'} className="w-16 h-16 rounded-full object-cover border" />}

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center mt-4">
              <div><h4 className="text-sm font-bold text-slate-800">{t('txt_capa_da_loja') || 'Capa da Loja'}</h4><p className="text-xs text-slate-500">{t('txt_propor_o_16_9') || 'Proporção 16:9'}</p></div>
              <label className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer">
                {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Carregar'}
                <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'cover')} />
              </label>
            </div>
            {draft.step3.coverUrl && <img loading="lazy" src={draft.step3.coverUrl} alt={t('txt_capa_135') || 'Capa'} className="w-full h-32 rounded-xl object-cover border" />}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-black text-slate-900 mb-4">{t('txt_passo_4_hor_rio') || 'Passo 4: Horário'}</h2>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p>{t('txt_configure_os_seus_hor_rios_de') || 'Configure os seus horários de funcionamento (Segunda a Domingo). Poderá definir pausas para almoço e copiar os horários entre dias.'}</p>
              <button className="mt-3 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold">{t('txt_configurar_depois_no_dashboard') || 'Configurar depois no Dashboard'}</button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-black text-slate-900 mb-4">{t('txt_passo_5_servi_os_iniciais') || 'Passo 5: Serviços Iniciais'}</h2>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex gap-2 mb-3">
                <input id="newServiceName" type="text" placeholder={t('txt_nome_ex_corte_homem') || 'Nome (Ex: Corte Homem)'} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                <input id="newServicePrice" type="number" placeholder={t('txt_pre_o') || 'Preço (€)'} className="w-24 px-3 py-2 border rounded-lg text-sm" />
                <button onClick={() => {
                  const n = (document.getElementById('newServiceName') as HTMLInputElement).value;
                  const p = (document.getElementById('newServicePrice') as HTMLInputElement).value;
                  if (n && p) {
                    updateDraft('step5', 'services', [...draft.step5.services, { name: n, price: p, duration: '30' }]);
                    (document.getElementById('newServiceName') as HTMLInputElement).value = '';
                    (document.getElementById('newServicePrice') as HTMLInputElement).value = '';
                  }
                }} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold">{t('add') || 'Adicionar'}</button>
              </div>
              <ul className="space-y-2">
                {draft.step5.services.map((s: any, idx: number) => (
                  <li key={idx} className="bg-white p-2 rounded-lg border text-sm flex justify-between items-center font-medium text-slate-700">
                    <span>{s.name}</span>
                    <span className="text-purple-600 font-bold">{s.price}€</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-black text-slate-900 mb-4">{t('txt_passo_6_funcion_rios') || 'Passo 6: Funcionários'}</h2>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
              <Users className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p>{t('txt_adicione_profissionais_sua_loj') || 'Adicione profissionais à sua loja, associe-os aos serviços que executam e defina os horários individuais.'}</p>
              <button className="mt-3 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold">{t('txt_apenas_eu_adicionar_mais_tarde') || 'Apenas Eu (Adicionar mais tarde)'}</button>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-black text-slate-900 mb-4">{t('txt_passo_7_plano_de_parceiro') || 'Passo 7: Plano de Parceiro'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div onClick={() => updateDraft('step7', 'plan', 'PRO')} className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${draft.step7.plan === 'PRO' ? 'border-purple-600 bg-purple-50/50' : 'border-slate-200 bg-white'}`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-black text-lg text-slate-900">{t('txt_pro_131') || 'PRO'}</h3>
                  {draft.step7.plan === 'PRO' && <Check className="w-5 h-5 text-purple-600" />}
                </div>
                <p className="text-2xl font-black text-purple-600 mb-1">{t('txt_14_dias_gr_tis') || '14 dias grátis'}</p>
                <p className="text-sm text-slate-500 mb-4">{t('txt_depois_29_90_m_s') || 'Depois 29.90€ / mês'}</p>
                <ul className="text-sm text-slate-700 space-y-2 mb-4 font-medium">
                  <li>{t('txt_agenda_inteligente') || '✔️ Agenda Inteligente'}</li>
                  <li>{t('txt_lembretes_sms') || '✔️ Lembretes SMS'}</li>
                  <li>{t('txt_presen_a_no_marketplace') || '✔️ Presença no Marketplace'}</li>
                </ul>
              </div>
              <div onClick={() => updateDraft('step7', 'plan', 'PRO_TERMINAL')} className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${draft.step7.plan === 'PRO_TERMINAL' ? 'border-purple-600 bg-purple-50/50' : 'border-slate-200 bg-white'}`}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-black text-lg text-slate-900 flex items-center gap-2"><Tablet className="w-5 h-5" />  {t('txt_pro_terminal_17') || 'PRO + TERMINAL'}</h3>
                  {draft.step7.plan === 'PRO_TERMINAL' && <Check className="w-5 h-5 text-purple-600" />}
                </div>
                <p className="text-2xl font-black text-purple-600 mb-1">{t('txt_14_dias_gr_tis') || '14 dias grátis'}</p>
                <p className="text-sm text-slate-500 mb-4">{t('txt_depois_49_90_m_s') || 'Depois 49.90€ / mês'}</p>
                <ul className="text-sm text-slate-700 space-y-2 mb-4 font-medium">
                  <li>{t('txt_tudo_do_plano_pro') || '✔️ Tudo do plano PRO'}</li>
                  <li>{t('txt_terminal_f_sico_glamzo') || '✔️ Terminal Físico Glamzo'}</li>
                  <li>{t('txt_cau_o_de_50_aplic_vel') || '✔️ Caução de 50€ aplicável'}</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-black text-slate-900 mb-4">{t('txt_passo_8_pagamentos_online') || 'Passo 8: Pagamentos Online'}</h2>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <CreditCard className="w-10 h-10 text-emerald-500 mb-4" />
              <h3 className="font-bold text-slate-800 text-lg mb-2">{t('txt_pretende_receber_pagamentos_on') || 'Pretende receber pagamentos online?'}</h3>
              <p className="text-sm text-slate-600 mb-6">{t('txt_permita_que_os_clientes_paguem') || 'Permita que os clientes paguem antecipadamente. Proteja-se contra faltas (no-shows).'}</p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => updateDraft('step8', 'onlinePayments', true)} className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-colors ${draft.step8.onlinePayments ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-700 border-slate-200'}`}>
                  
                                              {t('txt_sim_ativar_stripe') || 'Sim, ativar Stripe'}
                                            </button>
                <button onClick={() => updateDraft('step8', 'onlinePayments', false)} className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-colors ${!draft.step8.onlinePayments ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-200'}`}>
                  
                                              {t('txt_n_o_apenas_no_local') || 'Não, apenas no local'}
                                            </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-4">{t('txt_mesmo_sem_pagamentos_online_a') || '* Mesmo sem pagamentos online, a sua loja pode ficar ativa no marketplace.'}</p>
            </div>
          </div>
        );
      case 9:
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-black text-slate-900 mb-4">{t('txt_passo_9_resumo_e_publica_o') || 'Passo 9: Resumo e Publicação'}</h2>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden shrink-0 border">
                  {draft.step3.logoUrl && <img loading="lazy" src={draft.step3.logoUrl} alt={t('txt_logo_136') || 'Logo'} className="w-full h-full object-cover" />}
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">{draft.step1.name}</h3>
                  <p className="text-xs text-slate-500">{draft.step2.address}, {draft.step2.doorNumber} - {draft.step2.city}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl">
                <div><span className="text-slate-500 block text-xs uppercase font-bold">{t('txt_plano') || 'Plano:'}</span> <span className="font-bold text-purple-700">{draft.step7.plan}</span></div>
                <div><span className="text-slate-500 block text-xs uppercase font-bold">{t('txt_trial_18') || 'Trial:'}</span> <span className="font-bold text-emerald-600">{t('txt_ativo_14_dias') || 'Ativo (14 dias)'}</span></div>
                <div><span className="text-slate-500 block text-xs uppercase font-bold">{t('txt_pagamentos') || 'Pagamentos:'}</span> <span className="font-bold">{draft.step8.onlinePayments ? 'Stripe Connect' : 'Apenas Local'}</span></div>
                <div><span className="text-slate-500 block text-xs uppercase font-bold">{t('txt_marketplace') || 'Marketplace:'}</span> <span className="font-bold text-emerald-600">{t('txt_ativo_132') || 'Ativo'}</span></div>
              </div>
            </div>
            <button onClick={submitAll} disabled={submitting} className="w-full py-4 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white rounded-xl font-black text-lg uppercase tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-purple-500/20 disabled:opacity-50">
              {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
              
                                  {t('txt_colocar_loja_online') || 'Colocar Loja Online'}
                                </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-purple-200">
      <div className="max-w-3xl mx-auto pt-10 pb-20 px-4">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          
          {/* Progress Bar */}
          <div className="h-2 bg-slate-100 w-full">
            <div className="h-full bg-gradient-to-r from-purple-500 to-rose-500 transition-all duration-500 ease-out" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
          </div>

          <div className="p-6 sm:p-10">
            {errorMsg && <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-bold">{errorMsg}</div>}
            
            <div className="min-h-[400px]">
              {renderStep()}
            </div>

            {/* Navigation Footer */}
            {currentStep < totalSteps && (
              <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center">
                {currentStep > 1 ? (
                  <button onClick={handleBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 px-4 py-2">
                    <ArrowLeft className="w-4 h-4" />{t('back') || 'Voltar'}</button>
                ) : <div />}
                
                <button onClick={handleNext} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-all">
                  
                                                    {t('txt_pr_ximo_passo') || 'Próximo Passo'} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="mt-8 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                
                                              {t('txt_a_guardar_automaticamente_pode') || 'A guardar automaticamente... Pode sair e continuar mais tarde.'}
                                            </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
