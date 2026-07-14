import re

with open("src/pages/Admin.tsx", "r") as f:
    text = f.read()

target = """<span className="block font-bold text-xs text-slate-900 truncate">{chat.user?.full_name || 'Utilizador Desconhecido'}</span>
                            <span className="block text-[10px] text-slate-500 font-mono mt-0.5 truncate">{chat.user?.email || 'N/A'}</span>"""

replacement = """<div className="flex justify-between items-center mb-0.5">
                              <span className="block font-bold text-xs text-slate-900 truncate">{chat.user?.full_name || 'Utilizador Desconhecido'}</span>
                              {chat.user?.role === 'partner' || salons.find((s: any) => s.owner_id === chat.user_id) ? (
                                <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ml-2 truncate max-w-[50%]">LOJA: {salons.find((s: any) => s.owner_id === chat.user_id)?.name || chat.user?.full_name}</span>
                              ) : (
                                <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ml-2">CLIENTE</span>
                              )}
                            </div>
                            <span className="block text-[10px] text-slate-500 font-mono truncate">{chat.user?.email || 'N/A'}</span>"""

text = text.replace(target, replacement)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(text)

