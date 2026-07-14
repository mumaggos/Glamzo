import re

with open("src/pages/partner/tabs/MessagesTab.tsx", "r") as f:
    content = f.read()

if "PartnerDisputes" not in content:
    content = content.replace(
        "import SupportChat from \"../../../components/SupportChat\";",
        "import SupportChat from \"../../../components/SupportChat\";\nimport PartnerDisputes from \"../../../components/PartnerDisputes\";"
    )

content = content.replace(
    "const [activeTab, setActiveTab] = useState<'clientes' | 'suporte'>('clientes');",
    "const [activeTab, setActiveTab] = useState<'clientes' | 'suporte' | 'disputas'>('clientes');"
)

# Add the disputas button
disputas_btn = """        <button 
          onClick={() => setActiveTab('disputas')} 
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'disputas' ? 'bg-rose-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <ShieldAlert className="w-4 h-4" /> Disputas
        </button>"""

if "Disputas" not in content:
    content = content.replace(
        "Suporte Glamzo\n        </button>",
        "Suporte Glamzo\n        </button>\n" + disputas_btn
    )

# Render PartnerDisputes
render_logic = """        {activeTab === 'clientes' && <DashboardMessages businessId={business.id} />}
        {activeTab === 'suporte' && <SupportChat />}
        {activeTab === 'disputas' && <PartnerDisputes businessId={business.id} />}"""

# Replace the conditional render
content = re.sub(
    r"\{activeTab === 'clientes' \? \(\s*<DashboardMessages businessId=\{business\.id\} />\s*\) : \(\s*<SupportChat />\s*\)\}",
    render_logic,
    content
)

with open("src/pages/partner/tabs/MessagesTab.tsx", "w") as f:
    f.write(content)
