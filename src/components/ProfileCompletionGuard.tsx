import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { User, Phone, CheckCircle } from 'lucide-react';
import { useTranslation } from "react-i18next";

export function ProfileCompletionGuard() {
    const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'customer') {
        const missingName = !profile.full_name || profile.full_name.trim() === '';
        const missingPhone = !profile.phone || profile.phone.trim() === '';
        
        if (missingName || missingPhone) {
          setFullName(profile.full_name || "");
          setPhone(profile.phone || "");
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      }
    } else {
      setIsOpen(false);
    }
  }, [user, profile]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !phone.trim()) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim()
        })
        .eq('id', user!.id);

      if (updateError) throw updateError;
      
      // Force reload to get updated profile context
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      setError("Erro ao guardar perfil. Tente novamente.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"></div>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in flex flex-col p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Complete o seu Perfil</h2>
          <p className="text-sm text-slate-500 mt-2">
            Para poder fazer marcações, precisamos que nos forneça o seu nome e telemóvel.
          </p>
        </div>
        
        {error && (
          <div className="mb-4 bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-bold text-center border border-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
              Nome Completo
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full bg-slate-50 border border-slate-200 outline-none rounded-2xl pl-10 pr-4 py-3 text-sm font-bold focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
              Telemóvel
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: 912345678"
                className="w-full bg-slate-50 border border-slate-200 outline-none rounded-2xl pl-10 pr-4 py-3 text-sm font-bold focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/30 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Guardar e Continuar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
