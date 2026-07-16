with open("src/pages/Account.tsx", "r") as f:
    text = f.read()

target = """          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center text-white">
             <div className="flex items-center justify-center gap-2 text-amber-400 mb-1"><Sparkles className="w-4 h-4"/> <span className="text-xs font-bold uppercase tracking-widest">Glamzo Club</span></div>
             <span className="text-3xl font-black font-mono">{currentPointsBalance}</span>
             <span className="text-xs text-slate-300 block">Pontos Acumulados</span>
          </div>"""

replacement = """          <button onClick={() => setIsClubModalOpen(true)} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center text-white hover:bg-white/20 transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95 group relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-400/10 to-amber-500/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
             <div className="flex items-center justify-center gap-2 text-amber-400 mb-1"><Sparkles className="w-4 h-4"/> <span className="text-xs font-bold uppercase tracking-widest">Glamzo Club</span></div>
             <span className="text-3xl font-black font-mono">{currentPointsBalance}</span>
             <span className="text-xs text-slate-300 block">Gerir Pontos e Saldo <span className="inline-block transition-transform group-hover:translate-x-1">→</span></span>
          </button>"""

if target in text:
    text = text.replace(target, replacement)
    print("Replaced!")
else:
    print("Target not found!")

with open("src/pages/Account.tsx", "w") as f:
    f.write(text)
