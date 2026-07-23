import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Business } from '../../../types';

interface PartnerContextType {
  business: Business | null;
  staff: any[];
}
import { Loader2, Calendar as CalendarIcon, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useTranslation } from "react-i18next";

export default function PayoutsHistoryTab() {
    const { t } = useTranslation();
  const { business } = useOutletContext<PartnerContextType>();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPayouts() {
      if (!business?.id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/stripe/payouts/${business.id}`);
        if (!res.ok) {
          throw new Error('Falha ao carregar repasses');
        }
        const data = await res.json();
        setPayouts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPayouts();
  }, [business]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900">{t('txt_hist_rico_de_repasses') || 'Histórico de Repasses'}</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {payouts.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            
                                  {t('txt_ainda_n_o_tem_repasses_efetuad') || 'Ainda não tem repasses efetuados.'}
                                </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  
                                                        {t('txt_data_221') || 'Data'}
                                                      </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  
                                                        {t('txt_valor_222') || 'Valor'}
                                                      </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  
                                                        {t('txt_estado_223') || 'Estado'}
                                                      </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {payouts.map((payout) => (
                <tr key={payout.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-slate-400" />
                      {format(new Date(payout.created * 1000), "d 'de' MMMM, yyyy", { locale: pt })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {(payout.amount / 100).toFixed(2)} {payout.currency.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {payout.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />  {t('txt_pago_224') || 'Pago'}
                                                        </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3.5 h-3.5" /> {payout.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
