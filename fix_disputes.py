import re

with open("src/components/UniversalDisputes.tsx", "r") as f:
    text = f.read()

target = r"""<div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-slate-900">Detalhes do Caso</h3>
              <button onClick=\{\(\) => setSelectedDispute\(null\)\} className="text-slate-400 hover:text-slate-700 p-1">
                <Check className="w-5 h-5 rotate-45" />
              </button>
            </div>"""

replacement = """<div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <button onClick={() => setSelectedDispute(null)} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar à Lista
              </button>
              <h3 className="font-extrabold text-slate-900 text-sm hidden sm:block">Detalhes do Caso</h3>
              <button onClick={() => setSelectedDispute(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <Check className="w-5 h-5 rotate-45" />
              </button>
            </div>"""

text = re.sub(target, replacement, text)

with open("src/components/UniversalDisputes.tsx", "w") as f:
    f.write(text)
