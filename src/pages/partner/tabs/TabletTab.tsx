import React from "react";
import { useTranslation } from "react-i18next";

export default function TabletTab() {
    const { t } = useTranslation();
  return (
    <div className="animate-fade-in w-full max-w-7xl mx-auto space-y-6 text-slate-700">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-extrabold mb-4">{t('txt_terminal_glamzo') || 'Terminal Glamzo'}</h2>
        <p className="text-sm text-slate-500">
          
                            {t('txt_configura_o_teu_terminal_e_kio') || 'Configura o teu Terminal e Kiosk de check-in automático.'}
                          </p>
      </div>
    </div>
  );
}
