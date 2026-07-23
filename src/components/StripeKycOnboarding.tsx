import React, { useState, useEffect } from 'react';
import { loadConnectAndInitialize } from '@stripe/connect-js';
import { ConnectComponentsProvider, ConnectAccountOnboarding } from '@stripe/react-connect-js';
import { Loader2, AlertCircle } from 'lucide-react';

interface StripeKycOnboardingProps {
  businessId: string;
  ownerId: string;
  onComplete?: () => void;
}

export default function StripeKycOnboarding({ businessId, ownerId, onComplete }: StripeKycOnboardingProps) {
  const [stripeConnectInstance, setStripeConnectInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        const response = await fetch('/api/stripe/create-custom-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId, ownerId }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Erro ao comunicar com a Stripe');
        }

        const { client_secret } = await response.json();

        // Inicializar o Stripe Connect usando a publishable key do ambiente
        const fetchClientSecretFunc = () => Promise.resolve(client_secret);
        
        const instance = loadConnectAndInitialize({
          publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
          fetchClientSecret: fetchClientSecretFunc,
          appearance: {
            variables: {
              colorPrimary: '#7c3aed', // Purple-600 to match Glamzo
            },
          },
        });

        setStripeConnectInstance(instance);
      } catch (err: any) {
        console.error('Erro no KYC Onboarding:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (businessId && ownerId) {
      fetchClientSecret();
    }
  }, [businessId, ownerId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
        <p className="text-slate-600">A preparar o ambiente seguro da Stripe...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold mb-1">Erro na Configuração</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden border border-slate-200 bg-white">
      {stripeConnectInstance && (
        <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
          <ConnectAccountOnboarding 
            onExit={() => {
              if (onComplete) onComplete();
            }}
          />
        </ConnectComponentsProvider>
      )}
    </div>
  );
}
