import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { MAIN_CATEGORIES } from '../../utils/categoriesData';
import { PORTUGAL_GEO, getCoordinatesForCity } from '../../utils/geoData';
import { 
  Building2, MapPin, Image as ImageIcon, Clock, Scissors, Users, 
  CreditCard, Landmark, CheckCircle, ArrowRight, ArrowLeft, Loader2, Sparkles, Check
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Dados', icon: Building2 },
  { id: 2, title: 'Morada', icon: MapPin },
  { id: 3, title: 'Imagens', icon: ImageIcon },
  { id: 4, title: 'Horário', icon: Clock },
  { id: 5, title: 'Serviços', icon: Scissors },
  { id: 6, title: 'Equipa', icon: Users },
  { id: 7, title: 'Plano', icon: Sparkles },
  { id: 8, title: 'Pagamento', icon: Landmark },
  { id: 9, title: 'Resumo', icon: CheckCircle }
];

export default function SetupWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '', category: '', establishment_type: '', description: '', languages: [] as string[], phone: '', website: '',
    country: 'Portugal', district: '', county: '', city: '', zip_code: '', street: '', number: '',
    logo_url: '', cover_url: '', gallery_urls: [] as string[],
    schedule: {} as any,
    services_config: [] as any[],
    employees_config: [] as any[],
    selected_plan: 'PRO',
    accepts_online_payments: false
  });

  useEffect(() => {
    if (!user) return;
    loadOrCreateBusiness();
  }, [user]);

  const loadOrCreateBusiness = async () => {
    try {
      const { data, error } = await supabase.from('businesses').select('*').eq('owner_id', user!.id).maybeSingle();
      if (error) throw error;
      
      if (data) {
        if (data.setup_completed) {
          navigate('/partner/dashboard', { replace: true });
          return;
        }
        setBusinessId(data.id);
        setStep(data.setup_step || 1);
        setFormData({
          name: data.name || '', category: data.category || '', establishment_type: data.establishment_type || '',
          description: data.description || '', languages: data.languages || [], phone: data.phone || '', website: data.website || '',
          country: data.country || 'Portugal', district: data.district || '', county: data.county || data.locality || '', city: data.city || '',
          zip_code: data.zip_code || data.postal_code || '', street: data.address_line_1 || data.address || '', number: data.address_line_2 || data.door_number || '',
          logo_url: data.logo_url || '', cover_url: data.cover_url || '', gallery_urls: data.gallery_urls || [],
          schedule: data.schedule || {}, services_config: data.services_config || [], employees_config: data.employees_config || [],
          selected_plan: data.selected_plan || 'PRO', accepts_online_payments: data.accepts_online_payments || false
        });
      } else {
        const slug = 'temp-' + Date.now();
        const { data: newBiz, error: createError } = await supabase.from('businesses').insert({
          owner_id: user!.id, name: 'Nova Loja', slug, category: 'Salão de Cabeleireiro', phone: '', district: '', city: '', address: ''
        }).select('id').single();
        if (createError) throw createError;
        setBusinessId(newBiz.id);
        setStep(1);
      }
    } catch (err: any) {
      console.error('Error loading or creating business:', err);
      setErrorMsg(err.message || 'Erro a carregar a sua loja.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNext = async () => {
    if (!businessId) return;
    setErrorMsg(null);

    // Validation
    if (step === 1) {
      if (!formData.name.trim() || !formData.category || !formData.phone.trim()) {
        setErrorMsg('Por favor preencha o Nome, Categoria e Telefone.');
        return;
      }
    } else if (step === 2) {
      if (!formData.street.trim() || !formData.city.trim() || !formData.zip_code.trim() || !formData.district.trim() || !formData.county.trim()) {
        setErrorMsg('Por favor preencha todos os campos obrigatórios da morada.');
        return;
      }
    }

    setSaving(true);
    
    let updatePayload: any = {};
    
    if (step === 1) {
      updatePayload = { ...updatePayload, name: formData.name, category: formData.category, description: formData.description, phone: formData.phone };
    } else if (step === 2) {
      const coords = getCoordinatesForCity(formData.district, formData.city);
      updatePayload = { 
        ...updatePayload, 
        district: formData.district, 
        city: formData.city, 
        locality: formData.county,
        address: formData.street,
        door_number: formData.number,
        postal_code: formData.zip_code,
        latitude: coords.latitude,
        longitude: coords.longitude
      };
    } else if (step === 3) {
      updatePayload = { ...updatePayload, logo_url: formData.logo_url, cover_url: formData.cover_url };
    } else if (step === 9) {
      updatePayload = { 
        ...updatePayload,
        status: 'active'
      };
    }

    try {
      if (Object.keys(updatePayload).length > 0) {
        const { error } = await supabase.from('businesses').update(updatePayload).eq('id', businessId);
        if (error) throw error;
      }
      
      if (step === 9) {
        navigate('/partner/dashboard', { replace: true });
      } else {
        setStep(prev => prev + 1);
        window.scrollTo(0,0);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao guardar');
    } finally {
      setSaving(false);
    }
  };

  const updateForm = (key: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-slate-900">Configuração da Loja</h1>
            <span className="text-sm font-medium text-slate-500">Passo {step} de 9</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-rose-500 transition-all duration-500 ease-out"
              style={{ width: `${(step / 9) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-4 overflow-x-auto hide-scrollbar gap-2 pb-2">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isActive = s.id === step;
              const isPast = s.id < step;
              return (
                <div key={s.id} className={`flex flex-col items-center min-w-[56px] gap-1.5 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : isPast ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {isPast ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">{s.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8">
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200">
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-xl text-sm font-medium border border-rose-100 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900">Dados da Loja</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Nome do Estabelecimento *</label>
                  <input type="text" value={formData.name} onChange={e => updateForm('name', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500" placeholder="Ex: Glamzo Hair Salon" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Categoria *</label>
                  <select value={formData.category} onChange={e => updateForm('category', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                    <option value="">Selecione...</option>
                    {MAIN_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Descrição</label>
                  <textarea value={formData.description} onChange={e => updateForm('description', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 h-24" placeholder="Conte um pouco sobre o seu espaço..." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Telefone *</label>
                  <input type="text" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500" placeholder="+351 900 000 000" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900">Morada</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Procurar Morada (Google Maps)</label>
                  <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500" placeholder="Comece a escrever a morada..." />
                  <p className="text-xs text-slate-500 mt-1">Integração Autocomplete preparada.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Rua *</label>
                  <input type="text" value={formData.street} onChange={e => updateForm('street', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Número/Andar *</label>
                  <input type="text" value={formData.number} onChange={e => updateForm('number', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Distrito *</label>
                  <select value={formData.district} onChange={e => {
                    updateForm('district', e.target.value);
                    updateForm('county', ''); // reset county
                  }} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500">
                    <option value="">Selecione...</option>
                    {Object.keys(PORTUGAL_GEO).sort().map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Localidade *</label>
                  <select value={formData.county} onChange={e => updateForm('county', e.target.value)} disabled={!formData.district} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 disabled:opacity-50">
                    <option value="">Selecione...</option>
                    {formData.district && PORTUGAL_GEO[formData.district]?.sort().map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Cidade *</label>
                  <input type="text" value={formData.city} onChange={e => updateForm('city', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Código Postal *</label>
                  <input type="text" value={formData.zip_code} onChange={e => updateForm('zip_code', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900">Imagens</h2>
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <ImageIcon className="w-10 h-10 text-slate-400 mx-auto mb-4" />
                <p className="text-sm font-medium text-slate-700">Clique para adicionar fotos</p>
                <p className="text-xs text-slate-500 mt-1">Logo, Foto de Capa e Galeria</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900">Horário de Funcionamento</h2>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                Configuração para dias da semana.
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900">Serviços</h2>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                Criação de categorias e serviços com duração e preço.
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900">Equipa / Funcionários</h2>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                Registo de staff e alocação de serviços.
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900">Escolha o seu Plano</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  onClick={() => updateForm('selected_plan', 'PRO')}
                  className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${formData.selected_plan === 'PRO' ? 'border-purple-600 bg-purple-50/50 shadow-md' : 'border-slate-200 hover:border-purple-200'}`}
                >
                  <h3 className="text-xl font-bold text-slate-900">PRO</h3>
                  <p className="text-sm text-slate-500 mt-2">Gestão completa da loja online.</p>
                  <div className="mt-4 text-2xl font-bold text-slate-900">29.99€<span className="text-sm font-normal text-slate-500">/mês</span></div>
                  <div className="mt-2 text-xs font-bold text-emerald-600 bg-emerald-100 inline-block px-2 py-1 rounded">Trial Ativo</div>
                </div>
                <div 
                  onClick={() => updateForm('selected_plan', 'TERMINAL')}
                  className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${formData.selected_plan === 'TERMINAL' ? 'border-purple-600 bg-purple-50/50 shadow-md' : 'border-slate-200 hover:border-purple-200'}`}
                >
                  <h3 className="text-xl font-bold text-slate-900">PRO TERMINAL</h3>
                  <p className="text-sm text-slate-500 mt-2">Inclui Tablet dedicado + Caução.</p>
                  <div className="mt-4 text-2xl font-bold text-slate-900">49.99€<span className="text-sm font-normal text-slate-500">/mês</span></div>
                  <div className="mt-2 text-xs font-bold text-purple-600 bg-purple-100 inline-block px-2 py-1 rounded">Recomendado</div>
                </div>
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900">Pagamentos Online</h2>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                <p className="text-slate-700 font-medium mb-4">Pretende receber pagamentos online (cartão, MB WAY)?</p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => updateForm('accepts_online_payments', true)}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${formData.accepts_online_payments ? 'bg-purple-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    Sim, ativar Stripe
                  </button>
                  <button 
                    onClick={() => updateForm('accepts_online_payments', false)}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${!formData.accepts_online_payments ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    Não, apenas local
                  </button>
                </div>
                {formData.accepts_online_payments && (
                  <div className="mt-4 p-4 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium">
                    A configuração do Stripe Connect será iniciada após concluir o setup.
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="space-y-6 animate-fade-in text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Tudo Pronto!</h2>
              <p className="text-slate-600 max-w-md mx-auto">
                A sua loja <strong>{formData.name || 'Nova Loja'}</strong> está configurada. Ao clicar abaixo, a sua loja ficará ativa com o Trial iniciado e visível no Marketplace.
              </p>
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-slate-200 flex items-center justify-between">
            <button 
              disabled={step === 1 || saving}
              onClick={() => {
                setStep(s => s - 1);
                window.scrollTo(0,0);
              }}
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" /> Anterior
            </button>
            <button 
              onClick={handleSaveAndNext}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {step === 9 ? 'Colocar Loja Online' : 'Guardar e Continuar'}
              {step !== 9 && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
