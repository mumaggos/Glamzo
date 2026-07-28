import React, { useState } from 'react';
import { CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Business } from '../../types';

export const StripeActivationBanner = ({ business, user }: { business: Business | null, user: any }) => {
  const [loading, setLoading] = useState(false);

  if (!business || business.charges_enabled || business.stripe_account_id) return null;

  const triggerStripeOnboarding = async () => {
    if (!business) return;
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/connect/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          businessName: business.name,
          businessEmail: business.email || user?.email,
          returnUrl: `${window.location.origin}/partner/dashboard?status=connect_success`,
          refreshUrl: `${window.location.origin}/partner/dashboard?status=connect_refresh`
        })
      });
      
      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create connect session');
      }
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white rounded-2xl p-6 shadow-xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
      <div className="absolute -right-10 -top-10 opacity-10">
        <CreditCard className="w-40 h-40" />
      </div>
      <div className="relative z-10 max-w-2xl">
        <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
           Ative os pagamentos online e o seu Terminal Glamzo
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          Para poder processar pagamentos de clientes na sua plataforma e receber o seu equipamento físico, precisamos de validar a sua identidade financeira (KYC) em conformidade com as normas europeias.
        </p>
      </div>
      <button 
        onClick={triggerStripeOnboarding}
        disabled={loading}
        className="relative z-10 shrink-0 px-6 py-3.5 bg-white hover:bg-slate-50 text-indigo-900 rounded-xl font-bold uppercase tracking-wider text-sm transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Configurar Recebimentos <ArrowRight className="w-4 h-4" /></>}
      </button>
    </div>
  );
};
