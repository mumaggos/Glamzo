import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { ShieldCheck, Loader2 } from "lucide-react";
import StripeKycOnboarding from "../../../components/StripeKycOnboarding";
import { Business } from "../../../types";
import { useTranslation } from "react-i18next";

interface PartnerContextType {
  business: Business | null;
  user: any;
}

export default function FinanceSettingsTab() {
    const { t } = useTranslation();
  const { business, user } = useOutletContext<PartnerContextType>();
  const [paymentsEnabled, setPaymentsEnabled] = useState(business?.stripe_payments_enabled || false);

  useEffect(() => {
    // Sincronizar o estado local se o contexto do negócio for atualizado (ex: após webhook)
    if (business?.stripe_payments_enabled) {
      setPaymentsEnabled(true);
    }
  }, [business]);

  if (!business || !user) {
    return (
      <div className="flex justify-center items-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 mb-2">Configuração de Pagamentos</h2>
        <p className="text-slate-600">
          Gere os dados legais e bancários da sua loja para receber pagamentos online e comissões através da Glamzo.
        </p>
      </div>

      {paymentsEnabled ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-10 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <ShieldCheck className="w-10 h-10 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-emerald-900 mb-4">Conta Verificada e Pagamentos Ativos</h3>
          <p className="text-emerald-700 max-w-lg text-lg">
            A sua conta Stripe Connect está validada. Já se encontra totalmente habilitado(a) para receber pagamentos online e transferências bancárias automáticas de forma segura.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-amber-900 mb-2 text-lg">Ação Obrigatória: Verificação de Identidade (KYC)</h3>
            <p className="text-amber-800">
              Para cumprirmos as normas europeias e processarmos as transferências para a sua conta bancária, necessitamos que conclua o processo de verificação com a Stripe. Todo o processo é 100% seguro e os seus dados são guardados e encriptados diretamente pela Stripe.
            </p>
          </div>
          
          <StripeKycOnboarding 
            businessId={business.id} 
            ownerId={user.id} 
            onComplete={() => {
              // Quando o utilizador sair do modal (após ter submetido ou não),
              // a Glamzo fará a verificação via webhook da Stripe (account.updated)
              // Idealmente poderíamos re-fazer fetch ao DB aqui ou mostrar um alerta
              window.location.reload(); 
            }} 
          />
        </div>
      )}
    </div>
  );
}
