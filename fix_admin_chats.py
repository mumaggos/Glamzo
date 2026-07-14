import re

with open("src/pages/Admin.tsx", "r") as f:
    text = f.read()

# Let's replace the button content for the chat list in Admin
pattern = r'(<span className="block font-bold text-xs text-slate-900 truncate">)(.*?)(</span>\s*<span className="block text-\[10px\] text-slate-500 font-mono mt-0.5 truncate">)(.*?)(</span>)'

def replace_chat_button(m):
    return f"""
<div className="flex flex-col gap-1">
  <div className="flex justify-between items-center">
    {m.group(1)}{m.group(2)}{m.group(3)}
    {{chat.user?.role === 'partner' || salons.find((s: any) => s.owner_id === chat.user_id) ? (
      <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ml-2">LOJA: {{salons.find((s: any) => s.owner_id === chat.user_id)?.name || chat.user?.full_name}}</span>
    ) : (
      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ml-2">CLIENTE</span>
    )}}
  </div>
  <span className="block text-[10px] text-slate-500 font-mono truncate">{m.group(4)}</span>
</div>
"""

# Wait, let's make sure the regex matches perfectly
# "<span className="block font-bold text-xs text-slate-900 truncate">{chat.user?.full_name || 'Utilizador Desconhecido'}</span>"
# "<span className="block text-[10px] text-slate-500 font-mono mt-0.5 truncate">{chat.user?.email || 'N/A'}</span>"

