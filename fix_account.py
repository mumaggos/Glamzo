import re

with open("src/pages/Account.tsx", "r") as f:
    content = f.read()

# Add import
if "import ClientDisputes" not in content:
    content = content.replace(
        "import ClientMessages from '../components/ClientMessages';",
        "import ClientMessages from '../components/ClientMessages';\nimport ClientDisputes from '../components/ClientDisputes';"
    )

# Update state variables
content = content.replace(
    "const [activeTab, setActiveTab] = useState('reservas');",
    "const [activeTab, setActiveTab] = useState('reservas');"
)
content = content.replace(
    "const [messageTab, setMessageTab] = useState<'lojas' | 'suporte'>('lojas');",
    "const [messageTab, setMessageTab] = useState<'lojas' | 'mensagens' | 'disputas'>('mensagens');"
)

# Update tab lists
content = content.replace(
    "{ id: 'mensagens', icon: MessageSquare, label: 'Mensagens' },",
    "{ id: 'apoio', icon: MessageSquare, label: 'Centro de Apoio' },"
)
content = content.replace(
    "{ id: 'suporte', icon: HelpCircle, label: 'Apoio Técnico' }",
    ""
)
content = content.replace(
    "onClick={() => setActiveTab(tab.id as 'reservas' | 'mensagens' | 'perfil' | 'recompensas' | 'favoritos' | 'suporte')}",
    "onClick={() => setActiveTab(tab.id as 'reservas' | 'apoio' | 'perfil' | 'recompensas' | 'favoritos')}"
)

# Desktop tab list fix: the above replacement removes suporte but might leave a trailing comma.
# { id: 'favoritos', icon: Heart, label: 'Favoritos' }, \n { id: 'suporte'...} ->
# let's be careful with regex

content = re.sub(
    r"\{\s*id:\s*'favoritos',\s*icon:\s*Heart,\s*label:\s*'Favoritos'\s*\},?\s*\{\s*id:\s*'suporte',\s*icon:\s*HelpCircle,\s*label:\s*'Apoio Técnico'\s*\}",
    "{ id: 'favoritos', icon: Heart, label: 'Favoritos' }",
    content
)

# Mobile tabs:
content = re.sub(
    r"\{\s*id:\s*'mensagens',\s*icon:\s*MessageSquare,\s*label:\s*'Mensagens'\s*\},?",
    "{ id: 'apoio', icon: HelpCircle, label: 'Apoio' },",
    content
)
content = re.sub(
    r"\{\s*id:\s*'suporte',\s*icon:\s*HelpCircle,\s*label:\s*'Suporte'\s*\}",
    "",
    content
)
# Fix potential trailing commas in the array
content = re.sub(
    r"\{\s*id:\s*'favoritos',\s*icon:\s*Heart,\s*label:\s*'Favoritos'\s*\},\s*\]",
    "{ id: 'favoritos', icon: Heart, label: 'Favoritos' }\n        ]",
    content
)

# Build the new Apoio block
apoio_block = """        {/* CENTRO DE APOIO */}
        {activeTab === 'apoio' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/60 animate-fade-in flex flex-col h-[70vh]">
            <h3 className="text-xl font-black text-slate-900 mb-6">Centro de Apoio</h3>
            <div className="flex overflow-x-auto no-scrollbar gap-4 mb-4 pb-2">
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
            </div>
          </div>
        )}"""

# We need to replace the old activeTab === 'mensagens' block and activeTab === 'suporte' block
# This is tricky using regex across multiple lines if not careful.
# Instead, let's use a simpler way: find the blocks and string replace.

# Remove the 'suporte' block:
suporte_start = "{/* 4. SUPORTE E DISPUTAS */}"
# We'll just split and cut.
if suporte_start in content:
    idx1 = content.find(suporte_start)
    idx2 = content.find("{/* MODAL DE DISPUTAS E REVIEWS MANTIDOS AQUI NO FUNDO INTACTOS! */}", idx1)
    if idx1 != -1 and idx2 != -1:
        content = content[:idx1] + content[idx2:]

# Now replace 'mensagens' block with 'apoio' block
msg_start = "{activeTab === 'mensagens' && ("
msg_end = "        {/* 2. ABA DE PERFIL */}"
if msg_start in content:
    idx1 = content.find(msg_start)
    idx2 = content.find(msg_end, idx1)
    if idx1 != -1 and idx2 != -1:
        content = content[:idx1] + apoio_block + "\n\n" + content[idx2:]

with open("src/pages/Account.tsx", "w") as f:
    f.write(content)

