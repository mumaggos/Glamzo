import re

with open("src/pages/Account.tsx", "r") as f:
    text = f.read()

# Replace imports
text = re.sub(
    r"import ClientMessages from '\.\./components/ClientMessages';\nimport ClientDisputes from '\.\./components/ClientDisputes';\nimport SupportChat from '\.\./components/SupportChat';",
    "import UniversalInbox from '../components/UniversalInbox';\nimport UniversalDisputes from '../components/UniversalDisputes';",
    text
)

# Fix useState for messageTab
text = re.sub(
    r"const \[messageTab, setMessageTab\] = useState\<'lojas' \| 'mensagens' \| 'disputas'\>\('mensagens'\);",
    "const [messageTab, setMessageTab] = useState<'mensagens' | 'disputas'>('mensagens');",
    text
)

# Fix the JSX
target_jsx = """            <div className="flex overflow-x-auto no-scrollbar gap-4 mb-4 pb-2">
              <button 
                onClick={() => setMessageTab('mensagens')} 
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${messageTab === 'mensagens' ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <HelpCircle className="w-4 h-4" /> Suporte Glamzo
              </button>
              <button 
                onClick={() => setMessageTab('disputas')} 
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${messageTab === 'disputas' ? 'bg-rose-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <ShieldAlert className="w-4 h-4" /> Disputas
              </button>
              <button 
                onClick={() => setMessageTab('lojas')} 
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${messageTab === 'lojas' ? 'bg-purple-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <MessageSquare className="w-4 h-4" /> Lojas / Clientes
              </button>
            </div>
            
            <div className="flex-1 w-full relative bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
              {messageTab === 'lojas' && <ClientMessages />}
              {messageTab === 'mensagens' && <SupportChat />}
              {messageTab === 'disputas' && <ClientDisputes />}
            </div>"""

replacement_jsx = """            <div className="flex overflow-x-auto no-scrollbar gap-4 mb-4 pb-2">
              <button 
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
              </button>
            </div>
            
            <div className="flex-1 w-full relative bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
              {messageTab === 'mensagens' && <UniversalInbox myId={user.id} myType="customer" />}
              {messageTab === 'disputas' && <UniversalDisputes myId={user.id} myType="customer" />}
            </div>"""

text = text.replace(target_jsx, replacement_jsx)

with open("src/pages/Account.tsx", "w") as f:
    f.write(text)
