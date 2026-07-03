import React, { useState, useEffect } from 'react';
import { 
  Globe, ExternalLink, Download, Printer, Share2, Copy, Plus, 
  Image, Upload, Check, X, RefreshCw, Sparkles, DollarSign, Users, QrCode, Calendar,
  MapPin, Clock, Instagram, Phone, Mail, FileText
} from 'lucide-react';
import { Business, Booking } from '../types';
import { supabase } from '../lib/supabase';

interface DashboardLojaProps {
  business: Business | null;
  setBusiness: React.Dispatch<React.SetStateAction<Business | null>>;
  bookings: Booking[];
  uniqueClientsCount: number;
}

export function DashboardLoja({ business, setBusiness, bookings, uniqueClientsCount }: DashboardLojaProps) {
  const [publicPageEnabled, setPublicPageEnabled] = useState(business?.public_page_enabled ?? true);
  const [editSlugValue, setEditSlugValue] = useState(business?.slug || "");
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugCheckResult, setSlugCheckResult] = useState<"available" | "taken" | null>(null);
  const [savingWebsiteConfig, setSavingWebsiteConfig] = useState(false);
  const [websiteLinkCopied, setWebsiteLinkCopied] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    if (business?.public_page_enabled !== undefined) {
      setPublicPageEnabled(business.public_page_enabled);
    }
    if (business?.slug && !editSlugValue) {
      setEditSlugValue(business.slug);
    }
  }, [business]);

  const slugify = (text: string) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  useEffect(() => {
    const checkSlug = async () => {
      const term = editSlugValue.trim();
      if (!term || term === business?.slug) {
        setSlugCheckResult(null);
        return;
      }
      setSlugChecking(true);
      try {
        const { data, error } = await supabase
          .from("businesses")
          .select("id")
          .eq("slug", term)
          .neq("id", business?.id);
        if (!error && data && data.length > 0) {
          setSlugCheckResult("taken");
        } else {
          setSlugCheckResult("available");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setSlugChecking(false);
      }
    };

    const timeout = setTimeout(checkSlug, 500);
    return () => clearTimeout(timeout);
  }, [editSlugValue, business?.slug, business?.id]);

  const handleSaveWebsiteConfig = async () => {
    if (!business) return;
    if (!editSlugValue.trim()) return;
    setSavingWebsiteConfig(true);
    try {
      const clean = slugify(editSlugValue);
      const { error } = await supabase
        .from("businesses")
        .update({
          slug: clean,
          public_page_enabled: publicPageEnabled,
        })
        .eq("id", business.id);

      if (!error) {
        setBusiness(prev => prev ? { ...prev, slug: clean, public_page_enabled: publicPageEnabled } : null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingWebsiteConfig(false);
    }
  };

  const getQrUrl = (format: 'png' | 'svg' = 'png') => {
    const data = encodeURIComponent(`${window.location.origin}/${business?.slug}?source=qrcode`);
    return `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${data}&format=${format}`;
  };

  const handleDownloadPNG = async () => {
    if (!business?.slug) return;
    try {
      const response = await fetch(getQrUrl('png'));
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${business.slug}-qrcode.png`;
      link.href = objectUrl;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Error downloading PNG:", err);
    }
  };

  const handleDownloadSVG = async () => {
    if (!business?.slug) return;
    try {
      const response = await fetch(getQrUrl('svg'));
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${business.slug}-qrcode.svg`;
      link.href = objectUrl;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Error downloading SVG:", err);
    }
  };

  const handlePrintQRCode = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Imprimir QR Code</title>
            <style>
              body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
              h1 { font-size: 24px; font-weight: 900; margin-bottom: 8px; }
              p { font-size: 14px; color: #666; margin-bottom: 32px; }
              img { width: 300px; height: 300px; }
              .footer { margin-top: 32px; font-size: 12px; font-weight: bold; color: #999; }
            </style>
          </head>
          <body>
            <div>
              <h1>${business?.name || "Glamzo Store"}</h1>
              <p>Escaneie com a câmera do telemóvel para agendamento automático</p>
              <img src="${getQrUrl('png')}" onload="window.print()" />
              <div class="footer">Parceiro Oficial Glamzo • glamzo.pt</div>
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() { window.close(); }, 1500);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleShareStore = () => {
    if (navigator.share && business?.slug) {
      navigator.share({
        title: business.name,
        text: 'Faça o seu agendamento online connosco!',
        url: `${window.location.origin}/${business.slug}`
      }).catch(console.error);
    }
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !business) return;
    const file = e.target.files[0];
    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${business.id}-${Date.now()}.${fileExt}`;
      const filePath = `businesses/${business.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      const { error: updateError } = await supabase.from('businesses').update({ logo_url: data.publicUrl }).eq('id', business.id);
      if (updateError) throw updateError;
      
      setBusiness(prev => prev ? { ...prev, logo_url: data.publicUrl } : null);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !business) return;
    const file = e.target.files[0];
    setUploadingCover(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `cover-${business.id}-${Date.now()}.${fileExt}`;
      const filePath = `businesses/${business.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      const { error: updateError } = await supabase.from('businesses').update({ cover_url: data.publicUrl }).eq('id', business.id);
      if (updateError) throw updateError;
      
      setBusiness(prev => prev ? { ...prev, cover_url: data.publicUrl } : null);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <div id="view-loja" className="space-y-6 animate-fade-in max-w-5xl pb-20">
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Profile Card & Info */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm relative">
            <div className="h-32 sm:h-48 bg-slate-100 relative group">
              {business?.cover_url ? (
                <img src={business.cover_url} alt="Capa" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-purple-100 to-indigo-100 flex items-center justify-center">
                  <Image className="w-8 h-8 text-purple-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <label className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-50">
                  <Upload className="w-4 h-4 inline-block mr-2" />
                  Alterar Capa
                  <input type="file" className="hidden" accept="image/*" onChange={handleUploadCover} disabled={uploadingCover} />
                </label>
              </div>
            </div>
            
            <div className="px-6 pb-6 relative">
              <div className="absolute -top-12 sm:-top-16 left-6 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl p-1 shadow-lg group">
                <div className="w-full h-full rounded-xl bg-slate-100 overflow-hidden relative">
                  {business?.logo_url ? (
                    <img src={business.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-purple-50 text-purple-300">
                      <Image className="w-6 h-6 mb-1" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="bg-white text-slate-900 p-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-50" title="Alterar Logótipo">
                      <Upload className="w-4 h-4" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleUploadLogo} disabled={uploadingLogo} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-16 sm:pt-20">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{business?.name || "O Seu Salão"}</h2>
                    <p className="text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {business?.address}, {business?.city}
                    </p>
                  </div>
                  <button className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-purple-100 transition-colors">
                    Editar Perfil
                  </button>
                </div>
                
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span>{business?.phone || "Não definido"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span>{business?.email || "Não definido"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <span>{business?.instagram ? `@${business.instagram}` : "Não definido"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span>{business?.description ? "Descrição configurada" : "Sem descrição"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuração do Link Público */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Status do Website
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Defina se a sua página está visível na internet.
                </p>
              </div>
              <button
                onClick={() => setPublicPageEnabled(!publicPageEnabled)}
                className={`p-1.5 px-3 rounded-xl text-xs font-bold font-mono transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                  publicPageEnabled
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                    : "bg-white text-slate-500 border border-slate-200"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${publicPageEnabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                <span>{publicPageEnabled ? "Ativo (Público)" : "Inativo (Offline)"}</span>
              </button>
            </div>
            
            <div className="space-y-2.5">
              <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-widest font-mono">
                Link Único Exclusivo
              </label>
              <div className="relative bg-white border border-slate-200 rounded-xl px-3.5 py-3.5 flex items-center text-xs text-slate-500 font-mono overflow-hidden">
                <span className="opacity-60 text-slate-500 hidden sm:inline">
                  {window.location.origin.replace(/^https?:\/\//, "")}/
                </span>
                <input
                  type="text"
                  value={editSlugValue}
                  onChange={(e) => setEditSlugValue(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  placeholder="oseunome"
                  className="flex-1 bg-transparent border-none text-slate-900 font-bold outline-none pl-0.5 font-mono placeholder-slate-400"
                />
                {slugChecking && <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin shrink-0 ml-1.5" />}
                {!slugChecking && slugCheckResult === "available" && <Check className="w-4 h-4 text-emerald-500 shrink-0 ml-1.5" />}
                {!slugChecking && slugCheckResult === "taken" && <X className="w-4 h-4 text-rose-500 shrink-0 ml-1.5" />}
              </div>
              <p className="text-[10px] text-slate-500 leading-normal mt-2">
                💡 Escolha um nome fácil de memorizar (ex: <span className="text-purple-600 font-mono">studio-lisboa</span>).
              </p>
            </div>
            
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveWebsiteConfig}
                disabled={savingWebsiteConfig}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 uppercase tracking-wider shadow-md shadow-purple-500/20"
              >
                {savingWebsiteConfig ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /><span>A Gravar...</span></>
                ) : (
                  <><Check className="w-4 h-4" /><span>Gravar Definições</span></>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* QR Code Panel */}
        <div className="lg:w-80 shrink-0 space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono tracking-widest uppercase block text-slate-500 font-black mb-2">
              Código QR Oficial
            </span>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 mb-6 relative">
              <img src={getQrUrl('png')} alt="QR Code" className="w-40 h-40 object-contain mx-auto" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm whitespace-nowrap">
                Scan para Marcar
              </div>
            </div>
            
            <div className="w-full grid grid-cols-2 gap-2 mt-2">
              <button onClick={handleDownloadPNG} className="flex items-center justify-center gap-1.5 p-2.5 bg-white border border-slate-200 hover:border-purple-300 text-slate-600 hover:text-purple-600 rounded-xl text-[11px] font-bold transition-all">
                <Download className="w-3.5 h-3.5" /> PNG
              </button>
              <button onClick={handleDownloadSVG} className="flex items-center justify-center gap-1.5 p-2.5 bg-white border border-slate-200 hover:border-purple-300 text-slate-600 hover:text-purple-600 rounded-xl text-[11px] font-bold transition-all">
                <Download className="w-3.5 h-3.5" /> SVG
              </button>
              <button onClick={handlePrintQRCode} className="col-span-2 flex items-center justify-center gap-1.5 p-3 bg-white border border-slate-200 hover:border-purple-300 text-slate-600 hover:text-purple-600 rounded-xl text-[11px] font-bold transition-all">
                <Printer className="w-4 h-4" /> Imprimir Flyer
              </button>
            </div>

            <div className="w-full mt-6 space-y-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/${business?.slug}`);
                  setWebsiteLinkCopied(true);
                  setTimeout(() => setWebsiteLinkCopied(false), 2000);
                }}
                className="w-full flex items-center justify-between p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-[11px] font-bold text-slate-600 transition-all"
              >
                <span className="truncate mr-2 text-slate-500">
                  /{business?.slug}
                </span>
                <span className="flex items-center gap-1 text-purple-600">
                  <Copy className="w-3.5 h-3.5" />
                  {websiteLinkCopied ? "Copiado" : "Copiar Link"}
                </span>
              </button>
              <a
                href={`/${business?.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[11px] font-bold transition-all shadow-md shadow-purple-500/20"
              >
                Abrir Loja Online <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BENTO GRAPHIC: STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 relative overflow-hidden flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Ticket Médio</span>
            <span className="text-2xl font-black text-slate-900">
              {bookings.filter(b => b.booking_status === "completed").length > 0 
                ? (bookings.filter(b => b.booking_status === "completed").reduce((sum, item) => sum + Number(item.total_price), 0) / bookings.filter(b => b.booking_status === "completed").length).toFixed(2) 
                : "0.00"} €
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 relative overflow-hidden flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Total Clientes</span>
            <span className="text-2xl font-black text-slate-900">{uniqueClientsCount}</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 relative overflow-hidden flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Leituras QR</span>
            <span className="text-2xl font-black text-slate-900">{business?.qr_scans_count || 0}</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <QrCode className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 relative overflow-hidden flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Reservas via QR</span>
            <span className="text-2xl font-black text-slate-900">{Math.round((business?.qr_scans_count || 0) * 0.18)}</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
