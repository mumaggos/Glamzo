import re

with open("src/components/SupportChat.tsx", "r") as f:
    text = f.read()

imports = "import { Send, ShieldAlert, Sparkles, AlertCircle, MessageSquare, ChevronLeft, CheckCircle, Trash2 } from 'lucide-react';"
text = re.sub(r"import \{.*?\} from 'lucide-react';", imports, text)

# Add view state and actions
if "const [view, setView]" not in text:
    text = text.replace(
        "const [loading, setLoading] = useState(true);",
        "const [loading, setLoading] = useState(true);\n  const [view, setView] = useState<'inbox' | 'chat'>('inbox');"
    )

# Add clear chat function
clear_chat_fn = """  const handleClearChat = async () => {
    if (!user) return;
    const { error } = await supabase.from('support_messages').delete().eq('user_id', user.id);
    if (!error) {
      setMessages([]);
      setView('inbox');
    }
  };
"""

text = text.replace(
    "if (loading) return",
    clear_chat_fn + "\n  if (loading) return"
)

# Render
new_render = """  if (view === 'inbox') {
    const unreadCount = messages.filter(m => m.sender_role === 'admin' && !m.is_read).length;
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

    return (
      <div className="flex flex-col h-full bg-[#F8F9FC]">
        <div className="p-4 bg-white border-b border-slate-200 shrink-0 shadow-sm flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-lg">Caixa de Entrada</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div 
            onClick={() => {
              setView('chat');
              // Mark as read could go here
            }}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4 cursor-pointer hover:border-purple-300 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-900 truncate">Suporte Glamzo</h4>
                {lastMessage && (
                  <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">
                    {new Date(lastMessage.created_at).toLocaleDateString('pt-PT')}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 truncate">
                {lastMessage ? lastMessage.content : 'Olá! Como podemos ajudar?'}
              </p>
            </div>
            {unreadCount > 0 && (
              <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {unreadCount}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F8F9FC]">
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('inbox')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900">Suporte Glamzo</h3>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
            </p>
          </div>
        </div>
        <div className="relative group">
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
             <AlertCircle className="w-5 h-5" />
          </button>
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 overflow-hidden">
             <button onClick={handleClearChat} className="w-full text-left px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2">
               <Trash2 className="w-4 h-4" /> Apagar Conversa
             </button>
          </div>
        </div>
      </div>
"""

text = re.sub(r"  return \(\n    <div className=\"flex flex-col h-full bg-\[\#F8F9FC\]\">\n      <div className=\"p-4 bg-white border-b border-slate-200 flex items-center gap-3 shrink-0 shadow-sm\">\n        <div className=\"w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg\">\n          <Sparkles className=\"w-5 h-5\" />\n        </div>\n        <div>\n          <h3 className=\"font-black text-slate-900\">Suporte Glamzo</h3>\n          <p className=\"text-\[10px\] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1\">\n            <span className=\"w-1\.5 h-1\.5 bg-emerald-500 rounded-full animate-pulse\" /> Online\n          </p>\n        </div>\n      </div>", new_render, text)

# Add mark as read effect
mark_as_read_effect = """  useEffect(() => {
    if (view === 'chat' && user) {
      const markRead = async () => {
        const unreadAdminMsgs = messages.filter(m => m.sender_role === 'admin' && !m.is_read).map(m => m.id);
        if (unreadAdminMsgs.length > 0) {
          await supabase.from('support_messages').update({ is_read: true }).in('id', unreadAdminMsgs);
          setMessages(prev => prev.map(m => unreadAdminMsgs.includes(m.id) ? { ...m, is_read: true } : m));
        }
      };
      markRead();
    }
  }, [view, messages, user]);
"""

text = text.replace(
    "  const handleSend = async",
    mark_as_read_effect + "\n  const handleSend = async"
)

with open("src/components/SupportChat.tsx", "w") as f:
    f.write(text)

