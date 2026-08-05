import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Landmark, ArrowLeftRight, Smartphone, CreditCard, Settings } from 'lucide-react';

import { useTranslation } from 'react-i18next';

export default function FinanceNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const tabs = [
    { id: 'plan', label: t('partner.tabPlan'), icon: CreditCard, path: '/partner/dashboard/subscricao' },
    { id: 'config', label: t('partner.tabGlamzoPay'), icon: Settings, path: '/partner/dashboard/subscricao/configuracoes' },
    { id: 'payouts', label: t('partner.tabPayouts'), icon: ArrowLeftRight, path: '/partner/dashboard/subscricao/repasses' },
    { id: 'hardware', label: t('partner.tabHardware'), icon: Smartphone, path: '/partner/dashboard/subscricao/hardware' }
  ];

  return (
    <div className="mb-8">
      <div className="inline-flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60 w-full sm:w-auto">
        {tabs.map(tab => {
          const isActive = path === tab.path;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-200 ${
                isActive 
                  ? 'bg-white text-purple-700 shadow-sm ring-1 ring-black/5' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
