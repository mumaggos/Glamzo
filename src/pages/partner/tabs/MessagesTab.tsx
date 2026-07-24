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
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingDisputes, setPendingDisputes] = useState(0);

  React.useEffect(() => {
    if (!business) return;
    
    const fetchCounts = async () => {
      const { supabase } = await import('../../../lib/supabase');
      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', business.owner_id)
        .eq('is_read', false);
        
      if (msgCount !== null) setUnreadMessages(msgCount);
      
      const { count: dispCount } = await supabase
        .from('disputes')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)
        .eq('status', 'open');
        
      if (dispCount !== null) setPendingDisputes(dispCount);
    };
    
    fetchCounts();
    
    import('../../../lib/supabase').then(({ supabase }) => {
      const channelMsg = supabase.channel('partner_msg_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${business.owner_id}` }, () => fetchCounts())
        .subscribe();
        
      const channelDisp = supabase.channel('partner_disp_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'disputes', filter: `business_id=eq.${business.id}` }, () => fetchCounts())
        .subscribe();
        
      return () => {
        supabase.removeChannel(channelMsg);
        supabase.removeChannel(channelDisp);
      };
    });
  }, [business]);

  if (!business) return null;

  return (
    <div className="animate-fade-in w-full max-w-[1600px] mx-auto text-slate-700 h-[calc(100vh-140px)] flex flex-col py-6">
      <div className="flex gap-4 mb-4 px-4 sm:px-0">
        <button 
          onClick={() => setActiveTab('mensagens')} 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'mensagens' ? 'bg-purple-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <MessageSquare className="w-4 h-4" /> 
          Mensagens
          {unreadMessages > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadMessages}</span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('disputas')} 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'disputas' ? 'bg-rose-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <ShieldAlert className="w-4 h-4" /> 
          Disputas
          {pendingDisputes > 0 && (
            <span className="bg-white text-rose-600 text-[10px] px-2 py-0.5 rounded-full">{pendingDisputes}</span>
          )}
        </button>
      </div>
      
      <div className="flex-1 w-full relative bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">        
        {activeTab === 'mensagens' && <UniversalInbox myId={business.owner_id} myType="partner" />}
        {activeTab === 'disputas' && <UniversalDisputes myId={business.id} myType="partner" />}
      </div>
    </div>
  );
}
