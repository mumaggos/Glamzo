import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Scissors, Share, PlusSquare, Download } from "lucide-react";

export default function StaffLogin() {
    const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallHelp(true);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // In a real app we'd use proper auth, but since we're using temp_password on staff table:
      const { data, error: fetchErr } = await supabase
        .from('staff')
        .select('*')
        .eq('email', email)
        .eq('temp_password', password)
        .eq('is_active', true)
        .single();
        
      if (fetchErr || !data) {
        throw new Error("Credenciais inválidas");
      }

      // We'll store this simple session in localStorage
      localStorage.setItem('staff_session', JSON.stringify(data));
      navigate("/staff/dashboard");
    } catch (err: any) {
      setError(err.message || "Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-50 z-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-purple-600 mb-6">
          <Scissors className="w-12 h-12" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          
                            {t('txt_portal_do_funcion_rio') || 'Portal do Funcionário'}
                          </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          
                            {t('txt_acesso_exclusivo_para_profissi') || 'Acesso exclusivo para profissionais'}
                          </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl p-3 text-xs font-bold text-center">
                {error}
              </div>
            )}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                
                                              {t('txt_email_175') || 'Email'}
                                            </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm transition-all"
                  placeholder={t('txt_seu_email') || 'Seu email'}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                
                                              {t('txt_password_tempor_ria') || 'Password Temporária'}
                                            </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm transition-all"
                  placeholder={t('txt_text_34') || '••••••••'}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-black text-white bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all disabled:opacity-50 tracking-wider uppercase"
              >
                {loading ? "A entrar..." : "Entrar"}
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-purple-100 rounded-xl text-sm font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all"
            >
              <Download className="w-4 h-4" />
              
                                        {t('txt_instalar_app_no_telem_vel') || 'Instalar App no Telemóvel'}
                                      </button>
            
            {showInstallHelp && (
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-3">
                <p className="font-bold text-slate-800">{t('txt_como_instalar_a_app') || 'Como instalar a App:'}</p>
                
                <div>
                  <p className="font-bold text-purple-700 mb-1">{t('txt_no_iphone_safari') || '📱 No iPhone (Safari):'}</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>{t('txt_clica_no_cone_de_partilha') || 'Clica no ícone de partilha'} <Share className="w-3 h-3 inline mx-1" />  {t('txt_na_barra_inferior') || 'na barra inferior'}</li>
                    <li>{t('txt_desliza_para_baixo_e_escolhe') || 'Desliza para baixo e escolhe'} <strong>{t('txt_ecr_principal') || '"Ecrã Principal"'}</strong> <PlusSquare className="w-3 h-3 inline mx-1" /></li>
                    <li>{t('txt_clica_em') || 'Clica em'} <strong>{t('add') || 'Adicionar'}</strong>  {t('txt_no_canto_superior_direito') || 'no canto superior direito'}</li>
                  </ol>
                </div>

                <div>
                  <p className="font-bold text-rose-700 mb-1">{t('txt_no_android_chrome') || '📱 No Android (Chrome):'}</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>{t('txt_clica_nos_3_pontinhos_no_canto') || 'Clica nos 3 pontinhos no canto superior direito'}</li>
                    <li>{t('txt_escolhe_176') || 'Escolhe'} <strong>{t('txt_adicionar_ao_ecr_principal') || '"Adicionar ao ecrã principal"'}</strong></li>
                    <li>{t('txt_clica_em') || 'Clica em'} <strong>{t('add') || 'Adicionar'}</strong></li>
                  </ol>
                </div>
                
                <button 
                  onClick={() => setShowInstallHelp(false)}
                  className="w-full mt-2 py-2 text-center font-bold text-slate-500 hover:text-slate-700 transition"
                >{t('close') || 'Fechar'}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
