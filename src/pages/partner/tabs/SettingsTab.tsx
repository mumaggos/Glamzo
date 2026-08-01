import React, { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";
import { AddressAutocomplete } from "../../../components/AddressAutocomplete";
import { Settings, Image as ImageIcon, Building2, Clock, Check, Upload, Save, ShieldAlert, Shield, KeyRound, MapPin } from "lucide-react";
import { Business } from "../../../types";
import { supabase } from "../../../lib/supabase";

interface PartnerContextType {
  business: Business | null;
  loadLayoutData: () => void;
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || "AIzaSyAFrWnn99CMO62Tn4QBanzYMItXnuZbhGg";

const MapUpdater = ({ coordinates }: { coordinates: { lat: number; lng: number } | null }) => {
  const map = useMap();
  React.useEffect(() => {
    if (map && coordinates) {
      map.panTo(coordinates);
    }
  }, [map, coordinates]);
  return null;
};

export default function SettingsTab() {
  const { t } = useTranslation();
  const { business, loadLayoutData } = useOutletContext<PartnerContextType>();
  const [activeTab, setActiveTab] = useState("dados");

  const [savingDados, setSavingDados] = useState(false);
  const [savingSeguranca, setSavingSeguranca] = useState(false);
  const [providers, setProviders] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.app_metadata?.providers) {
        setProviders(data.user.app_metadata.providers);
      }
    });
  }, []);

  const [savingImagens, setSavingImagens] = useState(false);
  const [savingRegras, setSavingRegras] = useState(false);

  const [globalMessage, setGlobalMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Estados dos Formulários
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(business?.latitude ? {lat: business.latitude, lng: business.longitude} : null);
  const [formData, setFormData] = useState({
    name: business?.name || "",
    address: business?.address || "",
    door_number: business?.door_number || "",
    postal_code: business?.postal_code || "",
    city: business?.city || "",
    country: business?.country || "Portugal",
    phone: business?.phone || "",
    email: business?.email || "",
    currency: business?.currency || "EUR",
    timezone: business?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Lisbon"
  });

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || "",
        address: business.address || "",
        door_number: business.door_number || "",
        postal_code: business.postal_code || "",
        city: business.city || "",
        phone: business.phone || "",
        email: business.email || "",
        currency: business.currency || "EUR"
      });
    }
  }, [business]);

  const [passwordData, setPasswordData] = useState({
    current: "",
    newPassword: "",
    repeatNewPassword: ""
  });

  // Estado para guardar os Ficheiros Reais para upload no bucket correto
  const [selectedFiles, setSelectedFiles] = useState<{logo: File | null, cover: File | null}>({ logo: null, cover: null });
  const [images, setImages] = useState({
    logo_url: business?.logo_url || "",
    cover_url: business?.cover_url || ""
  });

  const [rules, setRules] = useState({
    min_notice: business?.min_booking_notice?.toString() || "60",
    cancellation_policy: business?.cancellation_policy?.includes(':') ? business.cancellation_policy.split(':')[0] : (business?.cancellation_policy || "flexible"),
    booking_end_margin: business?.cancellation_policy?.includes(':') ? business.cancellation_policy.split(':')[1] : (business?.booking_end_margin?.toString() || "0"),
    no_show_policy_enabled: business?.no_show_policy_enabled || false,
    no_show_fee_type: business?.no_show_fee_type || 'percentage',
    no_show_fee_value: business?.no_show_fee_value || 50,
    cancellation_window_hours: business?.cancellation_window_hours || 24
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!business) return null;

  const showMessage = (type: 'success' | 'error', text: string) => {
    setGlobalMessage({ type, text });
    setTimeout(() => setGlobalMessage(null), 5000);
  };

  
  const triggerGeocoding = async () => {
    if (!formData.address || !formData.city) return;
    try {
      const fullAddress = `${formData.address} ${formData.door_number ? formData.door_number + ',' : ''} ${formData.postal_code} ${formData.city}, Portugal`;
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

  useEffect(() => {
    if (!formData.address || !formData.city || !formData.postal_code) return;
    const delayDebounceFn = setTimeout(() => {
      triggerGeocoding();
    }, 1500);
    return () => clearTimeout(delayDebounceFn);
  }, [formData.address, formData.door_number, formData.city, formData.postal_code]);

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    let newFormData = { ...formData };
    let pc = '', c = '', ct = '', route = '', streetNumber = '';

    if (place.geometry?.location) {
      setCoordinates({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
    }
    
    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types;
        if (types.includes('route')) route = component.long_name;
        if (types.includes('street_number')) streetNumber = component.long_name;
        if (types.includes('postal_code')) pc = component.long_name;
        if (types.includes('locality') || types.includes('postal_town') || types.includes('administrative_area_level_2')) c = component.long_name;
        if (types.includes('country')) ct = component.long_name;
      }
    }

    let finalDoorNumber = streetNumber;

    if (route) {
        newFormData.address = route;
    } else if (place.name) {
        newFormData.address = place.name.replace(/\d+/g, '').trim().replace(/,$/, '');
        if (!finalDoorNumber) {
            const match = place.name.match(/\d+/);
            if (match) finalDoorNumber = match[0];
        }
    } else if (place.formatted_address) {
        newFormData.address = place.formatted_address.split(',')[0].replace(/\d+/g, '').trim();
    }

    if (finalDoorNumber) newFormData.door_number = finalDoorNumber;
    if (pc) newFormData.postal_code = pc;
    if (c) newFormData.city = c;
    if (ct) newFormData.country = ct;
    
    setFormData(newFormData);
  };

  const handleSaveDados = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDados(true);
    try {
      
      // Remover campos que não existem na tabela
      const payloadToSave = { ...formData, latitude: coordinates?.lat || business.latitude, longitude: coordinates?.lng || business.longitude };
      
      
      const { error } = await supabase.from('businesses').update(payloadToSave).eq('id', business.id);
      if (error) throw error;
      showMessage('success', t('settings.succDataUpdated')); loadLayoutData();
    } catch (err) {
      showMessage('error', t('settings.errDataUpdate') + ": " + (err as any).message);
    } finally {
      setSavingDados(false);
    }
  };

  const handleSaveSeguranca = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSeguranca(true);
    if (passwordData.newPassword !== passwordData.repeatNewPassword) {
      showMessage('error', t('settings.errPasswordsNoMatch'));
      setSavingSeguranca(false); return;
    }
    if (passwordData.newPassword.length < 6) {
      showMessage('error', t('settings.errPasswordLength'));
      setSavingSeguranca(false); return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
      if (error) throw error;
      showMessage('success', t('settings.succPasswordChanged'));
      setPasswordData({ current: "", newPassword: "", repeatNewPassword: "" });
    } catch (err) {
      showMessage('error', t('settings.errPasswordChange'));
    } finally {
      setSavingSeguranca(false);
    }
  };

  const handleImageChange = (type: 'logo' | 'cover', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFiles(prev => ({ ...prev, [type]: file }));
      const url = URL.createObjectURL(file);
      setImages(prev => ({ ...prev, [`${type}_url`]: url }));
    }
  };

  const handleSaveImagens = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingImagens(true);
    try {
      let finalLogoUrl = images.logo_url;
      let finalCoverUrl = images.cover_url;

      // 1. Upload do Logótipo para o vosso bucket "business-images"
      if (selectedFiles.logo) {
        const fileExt = selectedFiles.logo.name.split('.').pop();
        const fileName = `logo_${business.id}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('business-images')
          .upload(fileName, selectedFiles.logo, { upsert: true });
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from('business-images').getPublicUrl(fileName);
        finalLogoUrl = data.publicUrl;
      }

      // 2. Upload da Capa da Loja
      if (selectedFiles.cover) {
        const fileExt = selectedFiles.cover.name.split('.').pop();
        const fileName = `cover_${business.id}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('business-images')
          .upload(fileName, selectedFiles.cover, { upsert: true });
          
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from('business-images').getPublicUrl(fileName);
        finalCoverUrl = data.publicUrl;
      }

      // 3. Submeter rotas permanentes na tabela
      const { error } = await supabase.from('businesses').update({
        logo_url: finalLogoUrl,
        cover_url: finalCoverUrl
      }).eq('id', business.id);
      
      if (error) throw error;
      
      showMessage('success', t('settings.succImagesSaved'));
      setSelectedFiles({ logo: null, cover: null });
    } catch (err: any) {
      console.error(err);
      showMessage('error', t('settings.errBucketPublic'));
    } finally {
      setSavingImagens(false);
    }
  };

  const handleSaveRegras = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRegras(true);
    try {
      const combinedPolicy = `${rules.cancellation_policy}:${rules.booking_end_margin}`;
      const { error } = await supabase.from('businesses').update({
        min_booking_notice: parseInt(rules.min_notice),
        cancellation_policy: combinedPolicy,
        booking_end_margin: parseInt(rules.booking_end_margin),
        no_show_policy_enabled: rules.no_show_policy_enabled,
        no_show_fee_type: rules.no_show_fee_type,
        no_show_fee_value: Number(rules.no_show_fee_value),
        cancellation_window_hours: Number(rules.cancellation_window_hours)
      }).eq('id', business.id);

      if (error) { throw error; }
      showMessage('success', t('settings.succRulesUpdated'));
    } catch (err) {
      showMessage('error', t('settings.errRulesUpdate'));
    } finally {
      setSavingRegras(false);
    }
  };

  return (
    <APIProvider apiKey={API_KEY || ''} language={localStorage.getItem('i18nextLng') || 'pt'} libraries={['places', 'marker']}>
    <div className="animate-fade-in w-full max-w-5xl mx-auto space-y-8 text-slate-700 py-6 pb-20">
      
      {globalMessage && (
        <div className={`p-4 rounded-xl text-sm font-bold animate-fade-in flex items-center gap-2 ${
          globalMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
        }`}>
          {globalMessage.type === 'success' ? <Check className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          {globalMessage.text}
        </div>
      )}

      <div className="border-b border-slate-100 pb-5 text-left">
        <h3 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-700" />
          <span>{t('settings.title')}</span>
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          {t('settings.subtitle')}
                          </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Interna das Definições */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <button onClick={() => setActiveTab("dados")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "dados" ? "bg-purple-50 text-purple-700" : "hover:bg-slate-50 text-slate-600"}`}>
            <Building2 className="w-4 h-4" /> {t('settings.tabStoreData')}
                                </button>
          <button onClick={() => setActiveTab("seguranca")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "seguranca" ? "bg-purple-50 text-purple-700" : "hover:bg-slate-50 text-slate-600"}`}>
            <KeyRound className="w-4 h-4" /> {t('settings.tabSecurity')}
                                </button>
          <button onClick={() => setActiveTab("imagens")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "imagens" ? "bg-purple-50 text-purple-700" : "hover:bg-slate-50 text-slate-600"}`}>
            <ImageIcon className="w-4 h-4" /> {t('settings.tabImages')}
                                </button>
          <button onClick={() => setActiveTab("regras")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "regras" ? "bg-purple-50 text-purple-700" : "hover:bg-slate-50 text-slate-600"}`}>
            <Clock className="w-4 h-4" /> {t('settings.tabRules')}
                                </button>
        </div>

        {/* Área do Conteúdo Ativo */}
        <div className="flex-1">
          
          {activeTab === "dados" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm animate-fade-in">
              <h4 className="text-lg font-black text-slate-900 mb-6">{t('settings.tabStoreData')}</h4>
              <form onSubmit={handleSaveDados} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.storeName')}</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
                  <div className="space-y-2 md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.fullAddress')}</label>
{API_KEY ? (<AddressAutocomplete 
  value={formData.address} 
  onChange={v => setFormData({...formData, address: v})} 
  onPlaceSelect={handlePlaceSelect} 
  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" 
/>) : (<input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" placeholder="Introduza a morada" />)}</div>
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.doorNumber')}</label><input type="text" value={formData.door_number} onChange={e => setFormData({...formData, door_number: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">País</label><input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.postalCode')}</label><input type="text" value={formData.postal_code} onChange={e => setFormData({...formData, postal_code: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.city')}</label><input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.phone')}</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>

                  <div className="space-y-2 md:col-span-2 pt-2">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('setupWizard.exactLocation', 'Localização Exata')}</label>
                    <p className="text-xs text-slate-500 mb-2.5">{t('setupWizard.mapHint', 'Arraste o pino para a localização exata da sua porta.')}</p>
                    <div className="h-64 rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100 shadow-inner">
                      {API_KEY ? (
                        <>
                          <Map
                            defaultCenter={coordinates || { lat: 39.3999, lng: -8.2245 }}
                            defaultZoom={coordinates ? 16 : 7}
                            onClick={(e) => {
                              if (e.detail.latLng) {
                                setCoordinates({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
                              }
                            }}
                            disableDefaultUI
                            style={{ width: '100%', height: '100%' }}
                          >
                            <MapUpdater coordinates={coordinates} />
                            <Marker 
                              position={coordinates || { lat: 39.3999, lng: -8.2245 }}
                              draggable={true}
                              onDragEnd={(e) => {
                                if (e.latLng) {
                                  setCoordinates({ lat: typeof e.latLng.lat === "function" ? e.latLng.lat() : e.latLng.lat, lng: typeof e.latLng.lng === "function" ? e.latLng.lng() : e.latLng.lng });
                                }
                              }}
                            />
                          </Map>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                          <MapPin className="w-8 h-8 text-slate-400 mb-2 animate-pulse" />
                          <span className="text-sm font-bold text-slate-700">{t('setupWizard.mapPreview', 'Mapa')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.currencyLabel', 'Moeda (Currency)')}</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl p-3 text-sm font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    >
                      <option value="EUR">{t('settings.currencyEur')}</option>
                      <option value="GBP">{t('settings.currencyGbp')}</option>
                      <option value="USD">{t('settings.currencyUsd')}</option>
                      <option value="BRL">{t('settings.currencyBrl')}</option>
                    </select>
                  </div>

                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fuso Horário / Timezone</label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 outline-none rounded-xl p-3 text-sm font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    >
                      {(Intl as any).supportedValuesOf('timeZone').map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.email')}</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={savingDados} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2">
                    {savingDados ? <Check className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />} {savingDados ? "A Guardar..." : "Guardar Dados"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "seguranca" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm animate-fade-in">
              <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-purple-600" /> {t('settings.changePassword')}</h4>
              {providers.includes('google') ? (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-bold text-purple-800">{t('settings.googleManaged')}</span>
                </div>
              ) : (
              <form onSubmit={handleSaveSeguranca} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.currentPassword')}</label><input type="password" value={passwordData.current} onChange={e => setPasswordData({...passwordData, current: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.newPassword')}</label><input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.repeatNewPassword')}</label><input type="password" value={passwordData.repeatNewPassword} onChange={e => setPasswordData({...passwordData, repeatNewPassword: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={savingSeguranca} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2">
                    {savingSeguranca ? <Check className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />} {savingSeguranca ? "A Guardar..." : "Atualizar Password"}
                  </button>
                </div>
              </form>
              )}
            </div>
          )}

          {activeTab === "imagens" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm animate-fade-in">
              <h4 className="text-lg font-black text-slate-900 mb-6">{t('settings.imagesTitle')}</h4>
              <form onSubmit={handleSaveImagens} className="space-y-8">
                <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={e => handleImageChange('logo', e)} />
                <input type="file" accept="image/*" className="hidden" ref={coverInputRef} onChange={e => handleImageChange('cover', e)} />

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.logo')}</label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                      {images.logo_url ? <img loading="lazy" src={images.logo_url} alt="Logo" className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-slate-300" />}
                    </div>
                    <button type="button" onClick={() => logoInputRef.current?.click()} className="bg-white border border-slate-200 hover:border-purple-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition">
                      <Upload className="w-4 h-4" /> {t('settings.chooseLogo')}
                                                              </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.storeCover')}</label>
                  <div className="w-full h-40 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative group">
                    {images.cover_url ? (
                      <img loading="lazy" src={images.cover_url} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400"><ImageIcon className="w-8 h-8 mb-2" /><span className="text-xs font-medium">{t('settings.noCover')}</span></div>
                    )}
                  </div>
                  <div className="flex justify-start">
                    <button type="button" onClick={() => coverInputRef.current?.click()} className="bg-white border border-slate-200 hover:border-purple-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition">
                      <Upload className="w-4 h-4" /> {t('settings.chooseCover')}
                                                              </button>
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={savingImagens} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2">
                    {savingImagens ? <Check className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />} {savingImagens ? "A Enviar para a Cloud..." : "Guardar Imagens"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "regras" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm animate-fade-in">
              <h4 className="text-lg font-black text-slate-900 mb-6">{t('settings.tabRules')}</h4>
              <form onSubmit={handleSaveRegras} className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.minAdvanceTime')}</label>
                    <select value={rules.min_notice} onChange={e => setRules({...rules, min_notice: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none">
                      <option value="0">{t('settings.noRestriction')}</option>
                      <option value="30">{t('settings.min30')}</option>
                      <option value="60">{t('settings.hour1')}</option>
                      <option value="120">{t('settings.hours2')}</option>
                      <option value="1440">{t('settings.hours24')}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.cancellationPolicy')}</label>
                    <select value={rules.cancellation_policy} onChange={e => setRules({...rules, cancellation_policy: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none">
                      <option value="flexible">{t('settings.flexiblePolicy')}</option>
                      <option value="moderate">{t('settings.moderatePolicy')}</option>
                      <option value="strict">{t('settings.strictPolicy')}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.bookingLimit')}</label>
                    <select value={rules.booking_end_margin} onChange={e => setRules({...rules, booking_end_margin: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none">
                      <option value="0">{t('settings.normalLimit')}</option>
                      <option value="-1">{t('settings.exactClosingLimit')}</option>
                      <option value="30">{t('settings.stop30mBefore')}</option>
                      <option value="60">{t('settings.stop1hBefore')}</option>
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">{t('settings.bookingLimitDesc')}</p>
                  </div>
                </div>

                  <div className="pt-6 border-t border-slate-100 space-y-6 mt-6">
                    <h5 className="font-bold text-slate-900 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-rose-500" /> Proteção contra No-Show</h5>
                    <p className="text-sm text-slate-500">Configure penalizações automáticas para clientes que não comparecem ou cancelam tarde demais.</p>
                    
                    <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:border-purple-300 transition-all">
                      <div className="relative">
                        <input type="checkbox" className="sr-only peer" checked={rules.no_show_policy_enabled} onChange={e => setRules({...rules, no_show_policy_enabled: e.target.checked})} />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </div>
                      <span className="font-bold text-slate-700 text-sm">Ativar Proteção contra No-Show</span>
                    </label>

                    {rules.no_show_policy_enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border border-purple-100 bg-purple-50/30 rounded-2xl animate-fade-in">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Taxa</label>
                          <select value={rules.no_show_fee_type} onChange={e => setRules({...rules, no_show_fee_type: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none">
                            <option value="percentage">Percentagem do Serviço (%)</option>
                            <option value="fixed">Valor Fixo (€)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Valor da Taxa</label>
                          <input type="number" value={rules.no_show_fee_value} onChange={e => setRules({...rules, no_show_fee_value: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cancelamento Grátis (Horas antes)</label>
                          <input type="number" value={rules.cancellation_window_hours} onChange={e => setRules({...rules, cancellation_window_hours: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" />
                        </div>
                      </div>
                    )}
                  </div>

                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={savingRegras} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2">
                    {savingRegras ? <Check className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />} {savingRegras ? "A Guardar..." : "Guardar Regras"}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div></div></div></APIProvider>);}
