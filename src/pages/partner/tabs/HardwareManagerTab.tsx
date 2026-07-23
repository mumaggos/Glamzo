import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Business } from '../../../types';

interface PartnerContextType {
  business: Business | null;
  staff: any[];
}
import { CreditCard, Smartphone, Check, Loader2 } from 'lucide-react';
import { useTranslation } from "react-i18next";

export default function HardwareManagerTab() {
    const { t } = useTranslation();
  const { business } = useOutletContext<PartnerContextType>();
  const [ordering, setOrdering] = useState(false);

  const handleOrder = async () => {
    if (!business?.id) return;
    
    setOrdering(true);
    try {
      const res = await fetch('/api/stripe/terminal/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erro ao processar encomenda');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao encomendar o terminal.');
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{t('txt_gest_o_de_hardware') || 'Gestão de Hardware'}</h2>
        <p className="text-slate-600 mt-1">
          
                            {t('txt_obtenha_leitores_de_cart_es_in') || 'Obtenha leitores de cartões integrados diretamente com a sua conta.'}
                          </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col">
          <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Smartphone className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{t('txt_tap_to_pay_no_iphone_android') || 'Tap to Pay no iPhone/Android'}</h3>
          <p className="text-slate-600 mb-6 flex-grow">
            
                                  {t('txt_aceite_pagamentos_sem_contacto') || 'Aceite pagamentos sem contacto diretamente no seu telemóvel, sem necessitar de hardware adicional.'}
                                </p>
          <ul className="space-y-3 mb-8">
            <li className="flex gap-3 text-sm text-slate-600"><Check className="w-5 h-5 text-green-500 shrink-0" />  {t('txt_zero_custo_de_hardware') || 'Zero custo de hardware'}</li>
            <li className="flex gap-3 text-sm text-slate-600"><Check className="w-5 h-5 text-green-500 shrink-0" />  {t('txt_aceita_apple_pay_google_pay_e') || 'Aceita Apple Pay, Google Pay e cartões contactless'}</li>
          </ul>
          <button className="w-full py-2.5 px-4 rounded-lg font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            
                                  {t('txt_dispon_vel_brevemente') || 'Disponível Brevemente'}
                                </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            
                                  {t('txt_recomendado_213') || 'Recomendado'}
                                </div>
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <CreditCard className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{t('txt_terminal_f_sico_stripe_reader') || 'Terminal Físico (Stripe Reader)'}</h3>
          <p className="text-slate-600 mb-6 flex-grow">
            
                                  {t('txt_leitor_de_cart_es_f_sico_dedic') || 'Leitor de cartões físico dedicado, ideal para o balcão. Liga-se por Bluetooth à sua App.'}
                                </p>
          <ul className="space-y-3 mb-8">
            <li className="flex gap-3 text-sm text-slate-600"><Check className="w-5 h-5 text-green-500 shrink-0" />  {t('txt_aceita_cart_es_com_chip_e_pin') || 'Aceita cartões com chip e PIN'}</li>
            <li className="flex gap-3 text-sm text-slate-600"><Check className="w-5 h-5 text-green-500 shrink-0" />  {t('txt_pagamento_nico_sem_mensalidade') || 'Pagamento único, sem mensalidades'}</li>
            <li className="flex gap-3 text-sm text-slate-600"><Check className="w-5 h-5 text-green-500 shrink-0" />  {t('txt_99_00_99_hardware_envio_expres') || '99,00€ / $99 (Hardware, Envio Expresso e Impostos incluídos)'}</li>
          </ul>
          <button 
            onClick={handleOrder}
            disabled={ordering}
            className="w-full py-2.5 px-4 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {ordering && <Loader2 className="w-4 h-4 animate-spin" />}
            
                                  {t('txt_encomendar_terminal') || 'Encomendar Terminal'}
                                </button>
        </div>
      </div>
    </div>
  );
}
