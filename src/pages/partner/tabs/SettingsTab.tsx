import React from "react";

export default function SettingsTab() {
  return (
    <div className="animate-fade-in w-full max-w-7xl mx-auto space-y-6 text-slate-700">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-extrabold mb-4">Configurações</h2>
        <p className="text-sm text-slate-500">
          Ajusta as preferências da tua conta, faturação e permissões.
        </p>
      </div>
    </div>
  );
}
