import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import UniversalInbox from "../../../components/UniversalInbox";
import UniversalDisputes from "../../../components/UniversalDisputes";
import { Business } from "../../../types";
import { MessageSquare, ShieldAlert } from "lucide-react";

interface PartnerContextType {
  business: Business | null;
}

export default function MessagesTab() {
  const { business } = useOutletContext<PartnerContextType>();
  const [activeTab, setActiveTab] = useState<'mensagens' | 'disputas'>('mensagens');

  if (!business) return null;

  return (
    <div className="animate-fade-in w-full max-w-[1600px] mx-auto text-slate-700 h-[calc(100vh-140px)] flex flex-col py-6">
      <div className="flex gap-4 mb-4 px-4 sm:px-0">
        <button 
          onClick={() => setActiveTab('mensagens')} 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'mensagens' ? 'bg-purple-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <MessageSquare className="w-4 h-4" /> Mensagens
        </button>
        <button 
          onClick={() => setActiveTab('disputas')} 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'disputas' ? 'bg-rose-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <ShieldAlert className="w-4 h-4" /> Disputas
        </button>
      </div>
      
      <div className="flex-1 w-full relative bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">        
        {activeTab === 'mensagens' && <UniversalInbox myId={business.id} myType="partner" />}
        {activeTab === 'disputas' && <UniversalDisputes myId={business.id} myType="partner" />}
      </div>
    </div>
  );
}
