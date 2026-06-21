import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { slugify, generateUniqueSlug } from '../utils/slugify';
import { PORTUGAL_GEO, getCoordinatesForCity } from '../utils/geoData';
import { 
  Building2, ArrowRight, ArrowLeft, Check, Store, Sparkles, 
  MapPin, Phone, Mail, FileText, Loader2, KeyRound, Eye, EyeOff, User 
} from 'lucide-react';

export default function PartnerSignup() {
  const { signUp, signOut, user, profile } = useAuth();
  const navigate = useNavigate();

  // Multi-step form step (1: Account info, 2: Business info)
  const [step, setStep] = useState(1);

  // Form states - Step 1
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form states - Step 2
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('Cabelo & Barbearia'); // Default to Cabelo & Barbearia
  const [district, setDistrict] = useState('Lisboa');
  const [city, setCity] = useState('Lisboa');
  const [address, setAddress] = useState('');
  const [doorNumber, setDoorNumber] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Auxiliary states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSignUpProcessActive, setIsSignUpProcessActive] = useState(false);

  // Verification
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');

  const categories = [
    'Cabelo & Barbearia',
    'Nails & Beauty',
    'Estética',
    'Wellness',
    'Ao domicílio',
    'Noivas & Eventos'
  ];

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMsg('Preencha todos os campos obrigatórios da sua conta.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('A palavra-passe deve conter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('As palavras-passe digitadas não coincidem.');
      return;
    }

    setStep(2);
  };

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!businessName.trim() || !city.trim() || !address.trim() || !phone.trim()) {
      setErrorMsg('Preencha os dados obrigatórios do estabelecimento (Nome, Cidade, Morada e Telefone).');
      return;
    }

    if (!acceptedTerms) {
      setErrorMsg('É obrigatório aceitar os Termos e a Política de Privacidade para prosseguir.');
      return;
    }

    setLoading(true);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);

    try {
      await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'verification_code',
          to: email,
          data: { 
            userName: fullName,
            code: code
          }
        })
      });
      setStep(3);
      setSuccessMsg('Enviámos um código para o seu e-mail. Por favor, introduza-o abaixo para concluir o registo.');
    } catch (err: any) {
      console.error('Failed to trigger verification email', err);
      setErrorMsg('Não foi possível enviar o e-mail de verificação. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (enteredCode !== verificationCode) {
      setErrorMsg('Código de verificação inválido.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    setIsSignUpProcessActive(true);

    try {
      // 1. Create authentication credential & profile with role 'business'
      const authResult = await signUp(email, password, fullName, 'business');
      const authUser = authResult?.user;

      if (!authUser) {
        throw new Error('Falha ao registar credenciais. Verifique os dados digitados.');
      }

      // 2. Generate unique business URL slug and insert directly into public.businesses
      const businessSlug = await generateUniqueSlug(businessName);
      const { latitude, longitude } = getCoordinatesForCity(district, city);

      const businessPayload = {
        owner_id: authUser.id,
        name: businessName,
        slug: businessSlug,
        category,
        district,
        city,
        address,
        door_number: doorNumber.trim() || null,
        postal_code: postalCode.trim() || null,
        latitude,
        longitude,
        phone,
        whatsapp: whatsapp.trim() || null,
        email: email,
        description: description.trim() || null,
        logo_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&h=150&fit=crop',
        cover_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=400&fit=crop'
      };

      let { data: insertedBiz, error: bizErr } = await supabase
        .from('businesses')
        .insert(businessPayload)
        .select('id')
        .maybeSingle();

      if (bizErr) {
        const isColumnErr = bizErr.code === '42703' || bizErr.message?.includes('column');
        if (isColumnErr) {
          console.warn('Geo or door number columns not available in table schema. Retrying fallback insertion...');
          const fallbackPayload = { ...businessPayload };
          delete (fallbackPayload as any).latitude;
          delete (fallbackPayload as any).longitude;
          delete (fallbackPayload as any).door_number;
          delete (fallbackPayload as any).postal_code;

          const retryResult = await supabase
            .from('businesses')
            .insert(fallbackPayload)
            .select('id')
            .maybeSingle();
          bizErr = retryResult.error;
          if (!bizErr && retryResult.data) {
            insertedBiz = retryResult.data;
          }
        }
      }

      if (bizErr) {
        console.error('Error inserting business profile:', bizErr);
        
        // Check if error is related to RLS policies (which happens when Email Confirmation is required)
        if (bizErr.message?.includes('row-level security') || bizErr.code === '42501') {
          console.warn('RLS blocked anonymous insert. Caching business payload and requiring email confirmation login.');
          localStorage.setItem('pending_business_payload', JSON.stringify(businessPayload));
          setSuccessMsg('Registo concluído! Como a segurança está ativada, por favor verifique primeiro a sua caixa de e-mail para validar a conta.');
          
          setTimeout(() => {
            navigate('/login?message=Por favor, confirme no seu e-mail antes de fazer o login.');
          }, 4500);
          return;
        }

        // If profile creation failed for other reasons, keep session clean
        throw new Error('Conta criada, mas ocorreu um erro ao inicializar o estabelecimento: ' + bizErr.message);
      }

      const businessId = insertedBiz?.id;
      if (!businessId) {
        throw new Error('O registo foi criado, mas não conseguimos recuperar o identificador do estabelecimento.');
      }

      setSuccessMsg('Registo concluído com sucesso e e-mail verificado! Redirecionando...');

      // Update database with default inactive state - requires card trial registration to unlock
      await supabase
        .from('businesses')
        .update({
          subscription_status: 'inactive',
          subscription_active: false,
          trial_ends_at: null,
          status: 'setup',
          trial_used: false
        })
        .eq('id', businessId);

      setTimeout(() => {
        navigate('/setup', { replace: true });
      }, 2000);

    } catch (err: any) {
      setIsSignUpProcessActive(false);
      console.error('Partner Registration error:', err);
      let userFriendlyMessage = err.message || 'Ocorreu um erro ao criar a conta de parceiro. Verifique os dados.';
      if (err.message?.includes('already registered') || err.message?.includes('already exists') || err.message?.toLowerCase().includes('already')) {
        userFriendlyMessage = 'Este e-mail já está registado na Glamzo. Por favor, utilize outro e-mail ou faça login com a sua conta existente.';
      }
      setErrorMsg(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="partner-signup-view" className="min-h-[calc(100vh-64px)] bg-slate-50 text-slate-800 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-purple-200 selection:text-purple-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl animate-fade-in text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-xs font-semibold text-purple-700 mb-4 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-purple-600" />
          <span>Inscrição Glamzo Parceiros</span>
        </div>
        <h2 className="text-3xl font-extrabold text-[#110724] tracking-tight font-display uppercase">
          Criar Conta Profissional<span className="text-purple-600 font-black">.</span>
        </h2>
        <p className="mt-2 text-xs text-slate-500 font-medium max-w-sm mx-auto">
          Gira a sua agenda de reservas, faturação e visibilidade de forma simples a partir de uma plataforma de elite dedicada.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white border border-slate-100 py-8 px-6 rounded-2xl shadow-sm sm:px-10">
          
          {/* Progress Bar / Steps indicator */}
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>1</span>
              <span className={`text-xs font-semibold ${step === 1 ? 'text-slate-800 font-bold' : 'text-slate-600'}`}>Conta de Acesso</span>
            </div>
            <div className="w-12 h-[1px] bg-slate-100 flex-1 mx-3" />
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>2</span>
              <span className={`text-xs font-semibold ${step === 2 ? 'text-slate-800 font-bold' : 'text-slate-600'}`}>Dados do Negócio</span>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              <p>{errorMsg}</p>
              {(errorMsg.includes('já está registado') || errorMsg.includes('já está associado') || errorMsg.toLowerCase().includes('already')) && (
                <div className="mt-2.5 text-left">
                  <Link 
                    to={`/partner/login?email=${encodeURIComponent(email)}`} 
                    className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-extrabold hover:underline"
                  >
                    <span>Iniciar Sessão como Parceiro Comercial &rarr;</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold animate-pulse">
              <p>{successMsg}</p>
            </div>
          )}

          {/* Active Session Detection Bypass */}
          {user && !isSignUpProcessActive ? (
            <div className="space-y-6 text-center py-4 animate-fade-in">
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl">
                <p className="text-sm font-bold text-slate-900 mb-2">Sessão Ativa Detetada!</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Está atualmente ligado como <span className="font-semibold text-purple-600">{profile?.full_name || user.email}</span> ({profile?.role === 'customer' ? 'Conta de Cliente' : 'Conta de Parceiro'}).
                </p>
              </div>
              {profile?.role === 'customer' ? (
                <div className="space-y-3">
                  <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                    As contas de Cliente e de Parceiro/Loja são totalmente independentes de modo a garantir a separação de dashboards. Por favor, termine a sessão da sua conta de cliente para poder criar o registo comercial do seu salão.
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        await signOut();
                        window.location.reload();
                      } catch (e) {}
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-sm text-xs uppercase tracking-wider cursor-pointer"
                  >
                    <span>Terminar Sessão de Cliente</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-sm text-xs uppercase tracking-wider cursor-pointer"
                >
                  <span>Ir para o Painel do Salão</span>
                </button>
              )}
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Nome Completo do Responsável
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-600"
                    placeholder="ex. Profissional Responsável"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  E-mail Comercial de Acesso
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-600"
                    placeholder="geral@oseunegocio.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Palavra-passe
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full px-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-600"
                      placeholder="Mín. 6 letras"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-600 hover:text-slate-650"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-600"
                    placeholder="Repita a senha"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 mt-6 py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold font-sans text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
              >
                <span>Inserir Dados do Estabelecimento</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : null}

          {/* Step 2: Business details form */}
          {step === 2 && (
            <form onSubmit={handleSendVerification} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Nome do Estabelecimento
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                      <Store className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-600"
                      placeholder="ex. Glamour Studio"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Categoria Principal
                  </label>
                  <select aria-label="Selecione uma opção"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Distrito / Região
                  </label>
                  <select aria-label="Selecione uma opção"
                    value={district}
                    onChange={(e) => {
                      const nextDist = e.target.value;
                      setDistrict(nextDist);
                      if (PORTUGAL_GEO[nextDist] && PORTUGAL_GEO[nextDist].length > 0) {
                        setCity(PORTUGAL_GEO[nextDist][0]);
                      }
                    }}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 cursor-pointer"
                  >
                    {Object.keys(PORTUGAL_GEO).sort().map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Cidade
                  </label>
                  <select aria-label="Selecione uma opção"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 cursor-pointer"
                  >
                    {(PORTUGAL_GEO[district] || []).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Morada / Nome da Rua *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-600"
                    placeholder="Rua das Flores"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Porta / Andar *
                  </label>
                  <input
                    type="text"
                    required
                    value={doorNumber}
                    onChange={(e) => setDoorNumber(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-600"
                    placeholder="ex. 12C, 3º Esq"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-600"
                    placeholder="ex. 1000-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Telefone de Contacto
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-600"
                      placeholder="Contacto comercial"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    WhatsApp (Opcional)
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-600"
                    placeholder="ex. +351900000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Breve Descrição do Negócio
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <span className="absolute top-3 left-3.5 flex items-start pointer-events-none text-slate-600">
                    <FileText className="w-4 h-4" />
                  </span>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800 placeholder:text-slate-600"
                    placeholder="Introduza uma breve apresentação do seu espaço e serviços especialidades..."
                  />
                </div>
              </div>

              {/* Checkbox Terms */}
              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="terms-partner"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-purple-600 bg-white border-slate-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="terms-partner" className="text-xs text-slate-600 leading-relaxed px-1">
                  Li e aceito os{' '}
                  <Link to="/termos-e-condicoes" target="_blank" className="font-semibold text-purple-600 hover:text-purple-700 underline">
                    Termos para Parceiros
                  </Link>{' '}
                  e a{' '}
                  <Link to="/politica-de-privacidade" target="_blank" className="font-semibold text-purple-600 hover:text-purple-700 underline">
                    Política de Privacidade e Tratamento GDPR
                  </Link>
                  .
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>A enviar...</span>
                    </>
                  ) : (
                    <>
                      <span>Avançar</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form className="space-y-4 animate-fade-in" onSubmit={handleRegister}>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full mb-4">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Verifique o seu e-mail</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Enviámos um código de 6 dígitos para o e-mail: <strong className="text-slate-800">{email}</strong>
                </p>
              </div>

              <div>
                <label htmlFor="verify-code" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 text-center">
                  Código de Verificação
                </label>
                <input
                  id="verify-code"
                  type="text"
                  required
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value)}
                  className="block w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>

                <button
                  type="submit"
                  disabled={loading || enteredCode.length !== 6}
                  className="w-2/3 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>A verificar...</span>
                    </>
                  ) : (
                    <>
                      <span>Criar Conta</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <p className="mt-8 text-center text-xs text-slate-500">
            Deseja aceder a uma conta existente?{' '}
            <Link to="/partner/login" className="font-bold text-purple-600 hover:text-purple-700">
              Iniciar sessão profissional
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
