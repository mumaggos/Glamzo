with open("src/pages/Admin.tsx", "r") as f:
    text = f.read()

text = text.replace(
    '<span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ml-2 truncate max-w-[50%]">LOJA:',
    '<span className="bg-purple-600 text-white px-2 py-1 text-xs rounded shrink-0 ml-2 truncate max-w-[50%]">LOJA:'
)
text = text.replace(
    '<span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ml-2">CLIENTE</span>',
    '<span className="bg-blue-600 text-white px-2 py-1 text-xs rounded shrink-0 ml-2">CLIENTE</span>'
)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(text)
