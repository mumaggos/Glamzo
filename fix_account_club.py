import re

with open("src/pages/Account.tsx", "r") as f:
    text = f.read()

# Add import
if "GlamzoClubModal" not in text:
    text = text.replace("import UniversalDisputes from '../components/UniversalDisputes';", "import UniversalDisputes from '../components/UniversalDisputes';\nimport GlamzoClubModal from '../components/GlamzoClubModal';")

# Add State
state_target = r"const \[activeTab, setActiveTab\] = useState\('reservas'\);"
new_state = """const [isClubModalOpen, setIsClubModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('reservas');"""
text = text.replace(state_target, new_state)

# Replace the Glamzo Club Banner with a button
banner_target = r"""          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center text-white">
             <div className="flex items-center justify-center gap-2 text-amber-400 mb-1"><Sparkles className="w-4 h-4"/> <span className="text-xs font-bold uppercase tracking-widest">Glamzo Club</span></div>
             <span className="text-3xl font-black font-mono">\{currentPointsBalance\}</span>
             <span className="text-xs text-slate-300 block">Pontos Acumulados</span>
          </div>"""
new_banner = """          <button onClick={() => setIsClubModalOpen(true)} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center text-white hover:bg-white/20 transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95 group relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-400/10 to-amber-500/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
             <div className="flex items-center justify-center gap-2 text-amber-400 mb-1"><Sparkles className="w-4 h-4"/> <span className="text-xs font-bold uppercase tracking-widest">Glamzo Club</span></div>
             <span className="text-3xl font-black font-mono">{currentPointsBalance}</span>
             <span className="text-xs text-slate-300 block">Gerir Pontos e Saldo <span className="inline-block transition-transform group-hover:translate-x-1">→</span></span>
          </button>"""
text = text.replace(banner_target, new_banner)

# Remove old recompensas tab button
old_tab_btn = r"""            \{ id: 'recompensas', icon: Gift, label: 'Recompensas' \},"""
text = text.replace(old_tab_btn, "")

# Remove old recompensas tab view completely
# This is tricky with regex, we can just replace the start and let the rest be invisible or remove it.
# Instead of doing complex regex, we can use sed logic or match until the next tab.
tab_content_target = r"""        \{/\* 3\. RECOMPENSAS & FIDELIDADE \*/\}
        \{activeTab === 'recompensas' && \((.*?)\)\}

        \{/\* 4\. FAVORITOS \*/\}"""
text = re.sub(r"\{\/\* 3\. RECOMPENSAS & FIDELIDADE \*\/\}[\s\S]*?\{\/\* 4\. FAVORITOS \*\/\}", "{/* 4. FAVORITOS */}", text)

# Add Modal rendering
modal_render = """      <GlamzoClubModal 
        isOpen={isClubModalOpen} 
        onClose={() => setIsClubModalOpen(false)} 
        user={user} 
        profile={profile}
        onPointsUpdate={() => loadUserRewards()} 
      />
      {reviewModalOpen && reviewBooking && ("""
text = text.replace("{reviewModalOpen && reviewBooking && (", modal_render)

with open("src/pages/Account.tsx", "w") as f:
    f.write(text)
