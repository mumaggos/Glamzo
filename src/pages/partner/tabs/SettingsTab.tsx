import React, { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Settings, Image as ImageIcon, Building2, Clock, Check, Upload, Save, ShieldAlert, Shield, KeyRound } from "lucide-react";
import { Business } from "../../../types";
import { supabase } from "../../../lib/supabase";

interface PartnerContextType {
  business: Business | null;
  loadLayoutData: () => void;
}

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
  const [formData, setFormData] = useState({
    name: business?.name || "",
    address: business?.address || "",
    door_number: business?.door_number || "",
    postal_code: business?.postal_code || "",
    city: business?.city || "",
    phone: business?.phone || "",
    email: business?.email || "",
    currency: business?.currency || "EUR",
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
        currency: business.currency || "EUR",
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
    booking_end_margin: business?.cancellation_policy?.includes(':') ? business.cancellation_policy.split(':')[1] : (business?.booking_end_margin?.toString() || "0")
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!business) return null;

  const showMessage = (type: 'success' | 'error', text: string) => {
    setGlobalMessage({ type, text });
    setTimeout(() => setGlobalMessage(null), 5000);
  };

  const handleSaveDados = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDados(true);
    try {
      const { error } = await supabase.from('businesses').update(formData).eq('id', business.id);
      if (error) throw error;
      showMessage('success', t('settings.succDataUpdated')); loadLayoutData();
    } catch (err) {
      showMessage('error', t('settings.errDataUpdate'));
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
        booking_end_margin: parseInt(rules.booking_end_margin)
      }).eq('id', business.id);
      
      if (error) {
        throw error;
      }
      
      showMessage('success', t('settings.succRulesUpdated'));
    } catch (err) {
      showMessage('error', t('settings.errRulesUpdate'));
    } finally {
      setSavingRegras(false);
    }
  };

  return (
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
                  <div className="space-y-2 md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.fullAddress')}</label><input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.doorNumber')}</label><input type="text" value={formData.door_number} onChange={e => setFormData({...formData, door_number: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.postalCode')}</label><input type="text" value={formData.postal_code} onChange={e => setFormData({...formData, postal_code: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.city')}</label><input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('settings.phone')}</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>

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
                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={savingRegras} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2">
                    {savingRegras ? <Check className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />} {savingRegras ? "A Guardar..." : "Guardar Regras"}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
