const fs = require('fs');

const code = `import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Settings, Image as ImageIcon, Building2, Clock, Check, Upload, Save } from "lucide-react";
import { Business } from "../../../types";

interface PartnerContextType {
  business: Business | null;
}

export default function SettingsTab() {
  const { business } = useOutletContext<PartnerContextType>();
  const [activeTab, setActiveTab] = useState("dados");

  const [savingDados, setSavingDados] = useState(false);
  const [savingImagens, setSavingImagens] = useState(false);
  const [savingRegras, setSavingRegras] = useState(false);

  if (!business) return null;

  const handleSaveDados = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDados(true);
    setTimeout(() => setSavingDados(false), 1000);
  };

  const handleSaveImagens = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingImagens(true);
    setTimeout(() => setSavingImagens(false), 1000);
  };

  const handleSaveRegras = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRegras(true);
    setTimeout(() => setSavingRegras(false), 1000);
  };

  return (
    <div className="animate-fade-in w-full max-w-5xl mx-auto space-y-8 text-slate-700 py-6">
      
      <div className="border-b border-slate-100 pb-5 text-left">
        <h3 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-700" />
          <span>Configurações</span>
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Ajuste as preferências da sua conta, imagens e regras.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("dados")}
            className={\`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all \${
              activeTab === "dados" ? "bg-purple-50 text-purple-700" : "hover:bg-slate-50 text-slate-600"
            }\`}
          >
            <Building2 className="w-4 h-4" /> Dados da Loja
          </button>
          <button
            onClick={() => setActiveTab("imagens")}
            className={\`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all \${
              activeTab === "imagens" ? "bg-purple-50 text-purple-700" : "hover:bg-slate-50 text-slate-600"
            }\`}
          >
            <ImageIcon className="w-4 h-4" /> Imagens
          </button>
          <button
            onClick={() => setActiveTab("regras")}
            className={\`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all \${
              activeTab === "regras" ? "bg-purple-50 text-purple-700" : "hover:bg-slate-50 text-slate-600"
            }\`}
          >
            <Clock className="w-4 h-4" /> Regras de Agendamento
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          
          {activeTab === "dados" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm animate-fade-in">
              <h4 className="text-lg font-black text-slate-900 mb-6">Dados da Loja</h4>
              <form onSubmit={handleSaveDados} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome da Loja</label>
                    <input type="text" defaultValue={business.name} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</label>
                    <input type="text" defaultValue={business.category} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Telefone</label>
                    <input type="text" defaultValue={business.phone} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                    <input type="email" defaultValue={business.email || ""} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Morada</label>
                    <input type="text" defaultValue={business.address} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={savingDados} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2">
                    {savingDados ? <Check className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />}
                    {savingDados ? "Guardado" : "Guardar Dados"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "imagens" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm animate-fade-in">
              <h4 className="text-lg font-black text-slate-900 mb-6">Imagens e Logótipo</h4>
              <form onSubmit={handleSaveImagens} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logótipo</label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                      {business.logo_url ? (
                        <img src={business.logo_url} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <button type="button" className="bg-white border border-slate-200 hover:border-purple-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition">
                      <Upload className="w-4 h-4" /> Alterar Logo
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Capa da Loja</label>
                  <div className="w-full h-40 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative group cursor-pointer">
                    {business.cover_url ? (
                      <img src={business.cover_url} alt="Cover" className="w-full h-full object-cover group-hover:opacity-50 transition" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/10">
                      <div className="bg-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Atualizar Capa
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={savingImagens} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2">
                    {savingImagens ? <Check className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />}
                    {savingImagens ? "Guardado" : "Guardar Imagens"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "regras" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm animate-fade-in">
              <h4 className="text-lg font-black text-slate-900 mb-6">Regras de Agendamento</h4>
              <form onSubmit={handleSaveRegras} className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Antecedência Mínima para Marcação</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none">
                      <option value="0">Sem restrição</option>
                      <option value="30">30 minutos</option>
                      <option value="60">1 hora</option>
                      <option value="120">2 horas</option>
                      <option value="1440">24 horas</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Política de Cancelamento</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:border-purple-500 focus:outline-none">
                      <option value="flexible">Flexível (Permitido até 2h antes)</option>
                      <option value="moderate">Moderada (Permitido até 12h antes)</option>
                      <option value="strict">Rigorosa (Permitido até 24h antes)</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={savingRegras} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2">
                    {savingRegras ? <Check className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />}
                    {savingRegras ? "Guardado" : "Guardar Regras"}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', code);
