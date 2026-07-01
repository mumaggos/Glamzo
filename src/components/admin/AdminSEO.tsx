import React from 'react';
import { Globe, Search, BarChart, Link as LinkIcon, AlertTriangle, TrendingUp } from 'lucide-react';

export default function AdminSEO() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h3 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          SEO & Sitemap Engine <Globe className="w-5 h-5 text-purple-600" />
        </h3>
        <p className="text-xs text-slate-600 mt-0.5">Gestão das páginas indexadas pelo Google (Localizações, Serviços, Trends e Perfils).</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-purple-500" />
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Páginas Indexadas</h4>
          </div>
          <p className="text-2xl font-black text-slate-900">12,482</p>
          <p className="text-[10px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +1,240 esta semana
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-blue-500" />
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Impressões Orgânicas</h4>
          </div>
          <p className="text-2xl font-black text-slate-900">482,109</p>
          <p className="text-[10px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +45% YoY
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon className="w-4 h-4 text-emerald-500" />
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Cliques Google</h4>
          </div>
          <p className="text-2xl font-black text-slate-900">45,210</p>
          <p className="text-[10px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> 9.3% CTR
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Erros 404</h4>
          </div>
          <p className="text-2xl font-black text-slate-900">12</p>
          <p className="text-[10px] text-amber-600 font-bold mt-1">A resolver</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6">
        <h4 className="font-bold text-slate-900 mb-4">Motor de Geração Automática (DynamicRouter)</h4>
        <div className="space-y-3">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
            <div>
              <p className="font-bold text-sm text-slate-900">Páginas de Cidade + Categoria</p>
              <p className="text-xs text-slate-500">Ex: /porto/barbearias, /lisboa/unhas</p>
            </div>
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">Ativo</span>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
            <div>
              <p className="font-bold text-sm text-slate-900">Páginas de Tendências</p>
              <p className="text-xs text-slate-500">Ex: /trends/low-fade, /trends/balayage</p>
            </div>
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">Ativo</span>
          </div>
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
            <div>
              <p className="font-bold text-sm text-slate-900">Integração Google Search Console API</p>
              <p className="text-xs text-slate-500">Envio automático do sitemap.xml após alterações na DB.</p>
            </div>
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">Em configuração</span>
          </div>
        </div>
      </div>
    </div>
  );
}
