import re

with open("src/pages/Account.tsx", "r") as f:
    content = f.read()

# Add Scissors and Search to imports
if "Search" not in content[:500]:
    content = content.replace("import { User,", "import { User, Search, Scissors,")

# Add statusColors and statusText
status_colors_decl = """
  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-slate-100 text-slate-700',
    cancelled: 'bg-rose-100 text-rose-700'
  };

  const statusText: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmada',
    completed: 'Concluída',
    cancelled: 'Cancelada'
  };
"""

content = content.replace("const [errorMsg, setErrorMsg] = useState('');", "const [errorMsg, setErrorMsg] = useState('');\n" + status_colors_decl)

with open("src/pages/Account.tsx", "w") as f:
    f.write(content)

