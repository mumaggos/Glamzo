with open("src/pages/Account.tsx", "r") as f:
    text = f.read()

# Add states for counts
if "const [unreadMessages, setUnreadMessages] = useState(0);" not in text:
    state_injection = """  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingDisputes, setPendingDisputes] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    const fetchCounts = async () => {
      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);
        
      if (msgCount !== null) setUnreadMessages(msgCount);
      
      const { count: dispCount } = await supabase
        .from('disputes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'open');
        
      if (dispCount !== null) setPendingDisputes(dispCount);
    };
    
    fetchCounts();
    
    const channelMsg = supabase.channel('account_msg_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, () => fetchCounts())
      .subscribe();
      
    const channelDisp = supabase.channel('account_disp_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'disputes', filter: `user_id=eq.${user.id}` }, () => fetchCounts())
      .subscribe();
      
    return () => {
      supabase.removeChannel(channelMsg);
      supabase.removeChannel(channelDisp);
    };
  }, [user]);"""

    # Insert after messageTab state
    text = text.replace("const [messageTab, setMessageTab] = useState<'mensagens' | 'disputas'>('mensagens');", 
                        "const [messageTab, setMessageTab] = useState<'mensagens' | 'disputas'>('mensagens');\n" + state_injection)

# Add badges to the buttons
target_buttons = """              <button 
                onClick={() => setMessageTab('mensagens')} 
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${messageTab === 'mensagens' ? 'bg-purple-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <MessageSquare className="w-4 h-4" /> Mensagens
              </button>
              <button 
                onClick={() => setMessageTab('disputas')} 
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${messageTab === 'disputas' ? 'bg-rose-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <ShieldAlert className="w-4 h-4" /> Disputas
              </button>"""

replacement_buttons = """              <button 
                onClick={() => setMessageTab('mensagens')} 
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${messageTab === 'mensagens' ? 'bg-purple-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <MessageSquare className="w-4 h-4" /> 
                Mensagens
                {unreadMessages > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{unreadMessages}</span>
                )}
              </button>
              <button 
                onClick={() => setMessageTab('disputas')} 
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${messageTab === 'disputas' ? 'bg-rose-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <ShieldAlert className="w-4 h-4" /> 
                Disputas
                {pendingDisputes > 0 && (
                  <span className="bg-white text-rose-600 text-[10px] px-2 py-0.5 rounded-full">{pendingDisputes}</span>
                )}
              </button>"""

text = text.replace(target_buttons, replacement_buttons)

with open("src/pages/Account.tsx", "w") as f:
    f.write(text)
