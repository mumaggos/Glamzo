import React, { useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { Settings, Image as ImageIcon, Building2, Clock, Check, Upload, Save, ShieldAlert, KeyRound, Zap, CreditCard } from "lucide-react";
import { Business } from "../../../types";
import { supabase } from "../../../lib/supabase";

interface PartnerContextType {
  business: Business | null;
}

export default function SettingsTab() {
  const { business } = useOutletContext<PartnerContextType>();
  const [activeTab, setActiveTab] = useState("dados");

  const [savingDados, setSavingDados] = useState(false);
  const [savingSeguranca, setSavingSeguranca] = useState(false);
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
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    newPassword: "",
    repeatNewPassword: ""
  });

  // O SEGREDO: Guardar o Ficheiro Real para enviar para o Supabase
  const [selectedFiles, setSelectedFiles] = useState<{logo: File | null, cover: File | null}>({ logo: null, cover: null });
  const [images, setImages] = useState({
    logo_url: business?.logo_url || "",
    cover_url: business?.cover_url || ""
  });

  const [rules, setRules] = useState({
    min_notice: business?.min_booking_notice?.toString() || "60",
    cancellation_policy: business?.cancellation_policy || "flexible"
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
      showMessage('success', 'Dados da loja atualizados com sucesso.');
    } catch (err) {
      showMessage('error', 'Erro ao atualizar dados da loja.');
    } finally {
      setSavingDados(false);
    }
  };

  const handleSaveSeguranca = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSeguranca(true);
    if (passwordData.newPassword !== passwordData.repeatNewPassword) {
      showMessage('error', 'As novas passwords não coincidem.');
      setSavingSeguranca(false); return;
    }
    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'A password deve ter pelo menos 6 caracteres.');
      setSavingSeguranca(false); return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
      if (error) throw error;
      showMessage('success', 'Password alterada com sucesso.');
      setPasswordData({ current: "", newPassword: "", repeatNewPassword: "" });
    } catch (err) {
      showMessage('error', 'Erro ao alterar a password.');
    } finally {
      setSavingSeguranca(false);
    }
  };

  const handleImageChange = (type: 'logo' | 'cover', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Guarda o ficheiro real na memória para o upload futuro
      setSelectedFiles(prev => ({ ...prev, [type]: file }));
      // Cria um link provisório para o preview no ecrã
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

      // 1. Upload do Logo (se foi alterado)
      if (selectedFiles.logo) {
        const fileExt = selectedFiles.logo.name.split('.').pop();
        const fileName = `logo_${business.id}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('businesses')
          .upload(fileName, selectedFiles.logo, { upsert: true });
          
        if (uploadError) throw uploadError;
        
        // Pega no URL público permanente
        const { data } = supabase.storage.from('businesses').getPublicUrl(fileName);
        finalLogoUrl = data.publicUrl;
      }

      // 2. Upload da Capa (se foi alterada)
      if (selectedFiles.cover) {
        const fileExt = selectedFiles.cover.name.split('.').pop();
        const fileName = `cover_${business.id}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('businesses')
          .upload(fileName, selectedFiles.cover, { upsert: true });
          
        if (uploadError) throw uploadError;
        
        // Pega no URL público permanente
        const { data } = supabase.storage.from('businesses').getPublicUrl(fileName);
        finalCoverUrl = data.publicUrl;
      }

      // 3. Guarda as rotas definitivas na base de dados
      const { error } = await supabase.from('businesses').update({
        logo_url: finalLogoUrl,
        cover_url: finalCoverUrl
      }).eq('id', business.id);
      
      if (error) throw error;
      
      showMessage('success', 'Imagens guardadas com sucesso na Cloud!');
      setSelectedFiles({ logo: null, cover: null }); // Limpa o estado
    } catch (err: any) {
      console.error(err);
      showMessage('error', 'Erro! Verifica se o bucket "businesses" existe e é Público no teu Supabase.');
    } finally {
      setSavingImagens(false);
    }
  };

  const handleSaveRegras = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRegras(true);
    try {
      const { error } = await supabase.from('businesses').update({ 
        min_booking_notice: parseInt(rules.min_notice),
        cancellation_policy: rules.cancellation_policy
      }).eq('id', business.id);
      if (error) throw error;
      showMessage('success', 'Regras de agendamento atualizadas com sucesso.');
    } catch (err) {
      showMessage('error', 'Erro ao atualizar regras.');
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
          <span>Configurações</span>
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Ajuste as preferências da sua conta, pagamentos e regras.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <button onClick={() => setActiveTab("dados")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "dados" ? "bg-purple-50 text-purple-700" : "hover:bg-slate-50 text-slate-600"}`}>
            <Building2 className="w-4 h-4" /> Dados da Loja
          </button>
          <button onClick={() => setActiveTab("pagamentos")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "pagamentos" ? "bg-purple-50 text-purple-700" : "hover:bg-slate-50 text-slate-600"}`}>
            <CreditCard className="w-4 h-4" /> Pagamentos & Plano
          </button>
          <button onClick={() => setActiveTab("seguranca")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "seguranca" ? "bg-purple-50 text-purple-700" : "hover:bg-slate-50 text-slate-600"}`}>
            <KeyRound className="w-4 h-4" /> Segurança
          </button>
          <button onClick={() => setActiveTab("imagens")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "imagens" ? "bg-purple-50 text-purple-700" : "hover:bg-slate-50 text-slate-600"}`}>
            <ImageIcon className="w-4 h-4" /> Imagens
          </button>
          <button onClick={() => setActiveTab("regras")} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "regras" ? "bg-purple-50 text-purple-700" : "hover:bg-slate-50 text-slate-600"}`}>
            <Clock className="w-4 h-4" /> Regras de Agendamento
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          
          {activeTab === "pagamentos" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm animate-fade-in space-y-8">
              <div><h4 className="text-lg font-black text-slate-900 mb-1">Pagamentos e Subscrição</h4><p className="text-xs text-slate-500 font-medium">Gere o teu plano e a ligação ao Stripe.</p></div>
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm"><Zap className="w-6 h-6 text-yellow-400" /></div>
                  <div><h3 className="font-black text-lg tracking-tight">Plano Glamzo PRO</h3><p className="text-slate-300 text-[10px] mt-1 uppercase font-bold tracking-wider">Acesso Total Ativo</p></div>
                </div>
                <span className="bg-emerald-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm relative z-10">Ativo</span>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><CreditCard className="w-5 h-5" /></div>
                  <div><h3 className="font-black text-slate-900 text-sm">Conta Stripe Connect</h3><p className="text-[10px] text-slate-500 font-medium mt-0.5">Recebe pagamentos online dos teus clientes.</p></div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between mb-4 shadow-sm">
                  <span className="text-xs font-bold text-slate-600">Estado da Conta:</span>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-200">Conectado</span>
                </div>
                <button className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 font-bold text-slate-700 text-sm rounded-xl transition shadow-sm flex justify-center items-center gap-2">Gerir Conta no Stripe</button>
              </div>
            </div>
          )}

          {activeTab === "dados" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm animate-fade-in">
              <h4 className="text-lg font-black text-slate-900 mb-6">Dados da Loja</h4>
              <form onSubmit={handleSaveDados} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome da Loja</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
                  <div className="space-y-2 md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Morada Completa</label><input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Porta / Andar</label><input type="text" value={formData.door_number} onChange={e => setFormData({...formData, door_number: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Código Postal</label><input type="text" value={formData.postal_code} onChange={e => setFormData({...formData, postal_code: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cidade</label><input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Telefone</label><input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
                  <div className="space-y-2 md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
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
              <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-purple-600" /> Alterar Password</h4>
              <form onSubmit={handleSaveSeguranca} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password Atual</label><input type="password" value={passwordData.current} onChange={e => setPasswordData({...passwordData, current: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nova Password</label><input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Repetir Nova Password</label><input type="password" value={passwordData.repeatNewPassword} onChange={e => setPasswordData({...passwordData, repeatNewPassword: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" /></div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={savingSeguranca} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2">
                    {savingSeguranca ? <Check className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />} {savingSeguranca ? "A Guardar..." : "Atualizar Password"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "imagens" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm animate-fade-in">
              <h4 className="text-lg font-black text-slate-900 mb-6">Imagens e Logótipo</h4>
              <form onSubmit={handleSaveImagens} className="space-y-8">
                
                <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={e => handleImageChange('logo', e)} />
                <input type="file" accept="image/*" className="hidden" ref={coverInputRef} onChange={e => handleImageChange('cover', e)} />

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logótipo</label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                      {images.logo_url ? <img src={images.logo_url} alt="Logo" className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-slate-300" />}
                    </div>
                    <button type="button" onClick={() => logoInputRef.current?.click()} className="bg-white border border-slate-200 hover:border-purple-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition">
                      <Upload className="w-4 h-4" /> Escolher Logótipo
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Capa da Loja</label>
                  <div className="w-full h-40 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative group">
                    {images.cover_url ? (
                      <img src={images.cover_url} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400"><ImageIcon className="w-8 h-8 mb-2" /><span className="text-xs font-medium">Sem imagem de capa</span></div>
                    )}
                  </div>
                  <div className="flex justify-start">
                    <button type="button" onClick={() => coverInputRef.current?.click()} className="bg-white border border-slate-200 hover:border-purple-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition">
                      <Upload className="w-4 h-4" /> Escolher Capa
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
              <h4 className="text-lg font-black text-slate-900 mb-6">Regras de Agendamento</h4>
              <form onSubmit={handleSaveRegras} className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Antecedência Mínima para Marcação</label>
                    <select value={rules.min_notice} onChange={e => setRules({...rules, min_notice: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none">
                      <option value="0">Sem restrição</option>
                      <option value="30">30 minutos</option>
                      <option value="60">1 hora</option>
                      <option value="120">2 horas</option>
                      <option value="1440">24 horas</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Política de Cancelamento</label>
                    <select value={rules.cancellation_policy} onChange={e => setRules({...rules, cancellation_policy: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none">
                      <option value="flexible">Flexível (Permitido até 2h antes)</option>
                      <option value="moderate">Moderada (Permitido até 12h antes)</option>
                      <option value="strict">Rigorosa (Permitido até 24h antes)</option>
                    </select>
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
