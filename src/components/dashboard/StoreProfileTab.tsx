import React from 'react';
import { Camera, MapPin, Clock, Globe, Instagram, Facebook, Edit2, Share2, Eye } from 'lucide-react';
import { Business } from '../../types';

interface StoreProfileTabProps {
  business: Business;
}

export function StoreProfileTab({ business }: StoreProfileTabProps) {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900">Perfil da Loja</h2>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
            <Eye className="w-4 h-4" /> Ver Página
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm">
            <Edit2 className="w-4 h-4" /> Editar Perfil
          </button>
        </div>
      </div>

      {/* Cover & Avatar Area */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Cover Photo */}
        <div className="h-64 bg-slate-200 relative group cursor-pointer">
          <img 
            src={business.logo_url || "https://images.unsplash.com/photo-1521590832167-7bfcfaa6362f?auto=format&fit=crop&q=80"} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm text-slate-900 px-4 py-2 rounded-full font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0">
              <Camera className="w-4 h-4" /> Alterar Capa
            </div>
          </div>
        </div>

        {/* Info Area */}
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 mb-6">
            <div className="w-32 h-32 bg-white rounded-2xl p-1 shadow-lg relative group cursor-pointer">
              <img 
                src={business.logo_url || `https://ui-avatars.com/api/?name=${business.name}&background=random`} 
                alt="Logo" 
                className="w-full h-full rounded-xl object-cover"
              />
              <div className="absolute inset-1 bg-black/0 group-hover:bg-black/40 rounded-xl transition-colors flex items-center justify-center">
                <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-black text-slate-900">{business.name}</h1>
              <p className="text-slate-500 font-medium">@{business.slug}</p>
            </div>
            <div className="pb-2 flex gap-2">
              <button className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Sobre Nós</h3>
                <p className="text-slate-700 leading-relaxed">
                  {business.description || "Adicione uma descrição apelativa para que os clientes conheçam melhor o seu espaço, a sua equipa e o tipo de experiência que oferece."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 text-slate-900 font-bold mb-1">
                    <MapPin className="w-5 h-5 text-purple-600" /> Localização
                  </div>
                  <p className="text-slate-600 text-sm ml-8">{business.address || "Morada não definida"}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 text-slate-900 font-bold mb-1">
                    <Globe className="w-5 h-5 text-purple-600" /> Links Oficiais
                  </div>
                  <div className="flex items-center gap-3 ml-8 mt-2">
                    <a href="#" className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center hover:bg-pink-200 transition-colors"><Instagram className="w-4 h-4" /></a>
                    <a href="#" className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"><Facebook className="w-4 h-4" /></a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Horário de Funcionamento
                </h3>
                <ul className="space-y-3">
                  {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day, i) => (
                    <li key={day} className="flex justify-between text-sm">
                      <span className="font-medium text-slate-600">{day}</span>
                      <span className="font-bold text-slate-900">{i === 6 ? 'Encerrado' : '09:00 - 19:00'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
