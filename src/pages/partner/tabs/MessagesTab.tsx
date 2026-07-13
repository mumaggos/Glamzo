import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import DashboardMessages from "../../../components/DashboardMessages";
import SupportChat from "../../../components/SupportChat";
import { Business } from "../../../types";
import { MessageSquare, ShieldAlert } from "lucide-react";

interface PartnerContextType {
  business: Business | null;
}

export default function MessagesTab() {
  const { business } = useOutletContext<PartnerContextType>();
  const [activeTab, setActiveTab] = useState<'clientes' | 'suporte'>('clientes');

  if (!business) return null;

  return (
    <div className="animate-fade-in w-full max-w-[1600px] mx-auto text-slate-700 h-[calc(100vh-140px)] flex flex-col py-6">
      <div className="flex gap-4 mb-4 px-4 sm:px-0">
        <button 
          onClick={() => setActiveTab('clientes')} 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'clientes' ? 'bg-purple-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <MessageSquare className="w-4 h-4" /> Clientes
        </button>
        <button 
          onClick={() => setActiveTab('suporte')} 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'suporte' ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <ShieldAlert className="w-4 h-4" /> Suporte Glamzo
        </button>
      </div>
      
      <div className="flex-1 w-full relative bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        {activeTab === 'clientes' ? (
          <DashboardMessages businessId={business.id} />
        ) : (
          <SupportChat />
        )}
      </div>
    </div>
  );
}
