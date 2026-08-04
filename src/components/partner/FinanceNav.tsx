import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Landmark, Settings, ArrowLeftRight, Smartphone } from 'lucide-react';

export default function FinanceNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const tabs = [
    { id: 'overview', label: 'Visão Geral & Razões', icon: Landmark, path: '/partner/dashboard/financeiro' },
    { id: 'config', label: 'Configurações Glamzo Pay', icon: Settings, path: '/partner/dashboard/financeiro/configuracoes' },
    { id: 'payouts', label: 'Histórico de Repasses', icon: ArrowLeftRight, path: '/partner/dashboard/financeiro/repasses' },
    { id: 'hardware', label: 'Terminal Físico (Hardware)', icon: Smartphone, path: '/partner/dashboard/financeiro/hardware' }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-200 pb-4">
      {tabs.map(tab => {
        const isActive = path === tab.path;
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${
              isActive ? 'bg-purple-100 text-purple-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
