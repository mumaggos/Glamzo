import re

with open("src/components/DashboardMessages.tsx", "r") as f:
    text = f.read()

# Fix the useEffect logic
text = text.replace("s.id === selectedSession.id", "s.customer_id === selectedSession.customer_id")

# Fix the Back button request
# "Quando a loja clica para conversar com um cliente, a janela ocupa o espaço inteiro e não tem como regressar à lista."
# "Adiciona um botão/ícone de seta "Voltar" (<- Voltar à lista) no topo/cabeçalho de cada janela de conversa aberta para permitir navegar facilmente entre conversas."
# I see there is an ArrowLeft, but it is md:hidden: `<button onClick={() => setSelectedSession(null)} className="md:hidden p-1.5 bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900"> <ArrowLeft className="w-4 h-4" /> </button>`
# It should be visible on all sizes to allow going back explicitly!
text = text.replace(
    'className="md:hidden p-1.5 bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900"',
    'className="p-1.5 bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 flex items-center gap-1 font-bold text-xs pr-3"'
)
text = text.replace(
    '<ArrowLeft className="w-4 h-4" />\n              </button>',
    '<ArrowLeft className="w-4 h-4" /> Voltar\n              </button>'
)

with open("src/components/DashboardMessages.tsx", "w") as f:
    f.write(text)

