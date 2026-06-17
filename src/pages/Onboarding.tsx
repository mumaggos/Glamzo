import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { slugify, generateUniqueSlug } from '../utils/slugify';
import { PORTUGAL_GEO, getCoordinatesForCity } from '../utils/geoData';
import { optimizeImageBeforeUpload } from '../utils/imageOptimizer';
import { 
  Building2, ArrowLeft, ArrowRight, Check, Store, Sparkles, 
  MapPin, Phone, Globe, Image, FileText, Loader2, Compass 
} from 'lucide-react';

export default function Onboarding() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Redirect if business already exists
  React.useEffect(() => {
    if (user) {
      supabase
        .from('businesses')
        .select('id, stripe_customer_id, subscription_status')
        .eq('owner_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            console.log("[Onboarding Redirect Check] Business already exists. Auto-redirecting to dashboard.", data);
            navigate('/dashboard', { replace: true });
          }
        });
    }
  }, [user, navigate]);

  // Multi-step progress tracker (1 to 7)
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  // Form Fields
  const [name, setName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Cabelo & Barbearia']);
  const [category, setCategory] = useState('Cabelo & Barbearia');
  const [district, setDistrict] = useState('Lisboa');
  const [city, setCity] = useState('Lisboa');
  const [doorNumber, setDoorNumber] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');

  // Storage upload states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // General submission flags
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleNext = () => {
    setErrorMsg(null);
    if (currentStep === 1 && !name.trim()) {
      setErrorMsg('Por favor, informe o nome do seu negócio.');
      return;
    }
    if (currentStep === 3 && !city.trim()) {
      setErrorMsg('Por favor, informe a cidade do estabelecimento.');
      return;
    }
    if (currentStep === 4 && !address.trim()) {
      setErrorMsg('Por favor, informe o endereço físico completo.');
      return;
    }
    if (currentStep === 5 && !phone.trim()) {
      setErrorMsg('O telefone de contato comercial é obrigatório.');
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (type === 'logo') setUploadingLogo(true);
    else setUploadingCover(true);
    setErrorMsg(null);

    try {
      // Direct WebP browser-side optimization & compression
      const optimized = await optimizeImageBeforeUpload(file);
      const filePath = `businesses/${user.id}-${type}-${Date.now()}.webp`;

      // Upload optimized high-performance .webp file directly with Cache-Control
      const { data, error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(filePath, optimized.blob, {
          cacheControl: 'public, max-age=31536000, stale-while-revalidate=86400, immutable',
          contentType: 'image/webp',
          upsert: true,
        });

      if (uploadErr) {
        throw new Error(
          `${uploadErr.message}. Experimente colar uma URL dinâmica como fallback caso o bucket de Storage não esteja com permissão pública.`
        );
      }

      // Retrieve public URL from storage
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (type === 'logo') {
        setLogoUrl(publicUrl);
      } else {
        setCoverUrl(publicUrl);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Falha ao enviar arquivo via Supabase Storage.');
    } finally {
      setUploadingLogo(false);
      setUploadingCover(false);
    }
  };

  const handleFinishOnboarding = async () => {
    if (!user) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Generate unique URL slug based on business name
      const businessSlug = await generateUniqueSlug(name);

      // Get computed coordinates from district + city mapping
      const { latitude, longitude } = getCoordinatesForCity(district, city);

      // 2. Prepare database model payload
      const businessPayload = {
        owner_id: user.id,
        name,
        slug: businessSlug,
        description: description || null,
        category: selectedCategories[0] || 'Cabelo & Barbearia',
        categories: selectedCategories, // Store multiple categories as text[]
        phone,
        email: email || user.email || null,
        district,
        city,
        address,
        postal_code: postalCode || null,
        door_number: doorNumber || null,
        latitude,
        longitude,
        logo_url: logoUrl || '/images/home/spa.webp', // Elegant default icon fallback
        cover_url: coverUrl || '/images/home/spa.webp', // Elegant header fallback
        whatsapp: whatsapp || null,
        instagram: instagram || null,
        website: website || null,
        is_verified: false,
      };

      // 3. Write record into businesses table with fallback in case columns are missing
      let { error: insertError } = await supabase
        .from('businesses')
        .insert(businessPayload);

      if (insertError) {
        // If it failed because database schema doesn't have the new fields, retry without them
        const isColumnErr = insertError.code === '42703' || insertError.message?.includes('column');
        if (isColumnErr) {
          console.warn('Geo, door number, or categories columns not available in table schema. Retrying fallback insertion...');
          const fallbackPayload = { ...businessPayload };
          delete (fallbackPayload as any).latitude;
          delete (fallbackPayload as any).longitude;
          delete (fallbackPayload as any).door_number;
          delete (fallbackPayload as any).categories;

          const retryResult = await supabase
            .from('businesses')
            .insert(fallbackPayload);
          insertError = retryResult.error;
        }
      }

      if (insertError) {
        throw insertError;
      }

      // 4. Update owner role to 'business' in profiles table
      const { error: roleUpError } = await supabase
        .from('profiles')
        .update({ role: 'business' })
        .eq('id', user.id);

      if (roleUpError) {
        console.warn('Silent issue attempting to update role:', roleUpError);
      } else {
        localStorage.setItem(`local_role_${user.id}`, 'business');
      }

      // 5. Force session and profile parameters reload
      await refreshProfile();

      // Go directly to newly populated business dashboard URL
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Houve um erro de validação ao criar o seu estabelecimento físico no banco de dados. Verifique sua conexão.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper metadata to show step summaries
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-800">
              <Store className="w-6 h-6 shrink-0" />
              <div className="text-xs">
                <span className="font-bold">Seja bem-vindo ao Hub de Parceiros!</span>
                <p className="text-slate-500 mt-0.5">Criaremos o seu estabelecimento no banco de dados para que você possa divulgar sua agenda profissional.</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Nome Comercial do Estabelecimento *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-600 transition-all text-slate-850"
                placeholder="Ex: Glamour Spa & Cabelo"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 animate-fade-in">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Categorias de beleza do seu estabelecimento (Selecione todas as aplicáveis)</span>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'Cabelo & Barbearia', label: '💇 Cabelo & Barbearia' },
                { key: 'Nails & Beauty', label: '💅 Nails & Beauty' },
                { key: 'Estética', label: '✨ Estética' },
                { key: 'Wellness', label: '💆 Wellness' },
                { key: 'Ao domicílio', label: '🏠 Ao domicílio' },
                { key: 'Noivas & Eventos', label: '👰 Noivas & Eventos' }
              ].map((c) => {
                const isSelected = selectedCategories.includes(c.key);
                return (
                  <button
                    type="button"
                    key={c.key}
                    onClick={() => {
                      if (isSelected) {
                        // Keep at least one category selected
                        if (selectedCategories.length > 1) {
                          setSelectedCategories(selectedCategories.filter(item => item !== c.key));
                        }
                      } else {
                        setSelectedCategories([...selectedCategories, c.key]);
                      }
                    }}
                    className={`p-3 text-xs font-medium rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/20 text-rose-700 font-bold'
                        : 'border-slate-250 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Distrito *</label>
                <select aria-label="Selecione uma opção"
                  value={district}
                  onChange={(e) => {
                    const nextDist = e.target.value;
                    setDistrict(nextDist);
                    if (PORTUGAL_GEO[nextDist] && PORTUGAL_GEO[nextDist].length > 0) {
                      setCity(PORTUGAL_GEO[nextDist][0]);
                    }
                  }}
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-600 transition-all text-slate-800 cursor-pointer"
                >
                  {Object.keys(PORTUGAL_GEO).sort().map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Cidade / Concelho *</label>
                <select aria-label="Selecione uma opção"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-600 transition-all text-slate-800 cursor-pointer"
                >
                  {(PORTUGAL_GEO[district] || []).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Morada Física Completa *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-600 transition-all text-slate-800"
                placeholder="Ex: Rua de Portugal"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Número da Porta *</label>
                <input
                  type="text"
                  required
                  value={doorNumber}
                  onChange={(e) => setDoorNumber(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-600 transition-all text-slate-800"
                  placeholder="Ex: 125, r/c esq"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Código Postal *</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-600 transition-all text-slate-800"
                  placeholder="Ex: 1000-100"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-3 animate-fade-in">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Contactos de Atendimento</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">Telefone Comercial *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-600 text-slate-800"
                  placeholder="Ex: +351 912 345 678"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">Link Whatsapp</label>
                <input
                  type="url"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-600 text-slate-800"
                  placeholder="Ex: https://wa.me/..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">E-mail Comercial (Opcional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-600 text-slate-800"
                  placeholder="Ex: salao@email.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">@ Instagram</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-600 text-slate-800"
                  placeholder="Ex: @glam_beautysalon"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4 animate-fade-in">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 text-left">Imagens do Salão</span>
            
            <div className="space-y-3.5">
              {/* Logo upload block */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Logo do Negócio (Proporção 1:1)</h4>
                  <p className="text-[10px] text-slate-600 mt-0.5">Formatos suportados: PNG, JPG ou WEBP.</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer border-none transition-colors">
                    {uploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Carregar Imagem'}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingLogo}
                      onChange={(e) => handleFileUpload(e, 'logo')}
                      className="hidden"
                    />
                  </label>
                  {logoUrl && <Check className="w-4 h-4 text-emerald-500" />}
                </div>
              </div>

              {/* Cover upload block */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Imagem de Capa (Proporção 16:9)</h4>
                  <p className="text-[10px] text-slate-600 mt-0.5">Exibida no topo da página de detalhes do salão.</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer border-none transition-colors">
                    {uploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Carregar Imagem'}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingCover}
                      onChange={(e) => handleFileUpload(e, 'cover')}
                      className="hidden"
                    />
                  </label>
                  {coverUrl && <Check className="w-4 h-4 text-emerald-500" />}
                </div>
              </div>

              {/* Direct URLs Fallbacks in case storage uploads fail or need explicit images */}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none mb-1">URL Direta do Logo (Opcional)</label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="Cole um link de imagem direta para o logotipo"
                    className="block w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-none mb-1">URL Direta da Capa (Opcional)</label>
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="Cole um link de imagem direta para a capa"
                    className="block w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Descrição dos Serviços *</label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-600 transition-all text-slate-800"
                placeholder="Apresente seu salão, os tratamentos de assinatura e o profissionalismo oferecido por suas equipes aqui..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div id="onboarding-view" className="min-h-[calc(110vh-64px)] bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        
        {/* Dynamic Horizontal Progress Bar indicator */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
          <div 
            className="h-full bg-rose-600 transition-all duration-300" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Heading metadata */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase font-black text-rose-600">
              Passo {currentStep} de {totalSteps}
            </span>
            <h1 className="text-xl font-extrabold text-slate-850 mt-1">Registo do Estabelecimento</h1>
          </div>
          <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Action Error Alerts */}
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Core dynamic body fields */}
        <div className="mb-8 min-h-[180px]">
          {renderStepContent()}
        </div>

        {/* Control navigation triggers */}
        <div className="flex justify-between items-center pt-5 border-t border-slate-100">
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-xl cursor-pointer transition-all shadow-sm"
            >
              <span>Avançar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinishOnboarding}
              disabled={submitting}
              className="flex items-center gap-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-6 py-2.5 rounded-xl cursor-pointer transition-all shadow-md shadow-rose-100 disabled:opacity-50"
              id="btn-confirm-onboarding"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Concluir Cadastro Comercial</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
