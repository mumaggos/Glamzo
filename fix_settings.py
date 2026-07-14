import re

with open("src/pages/partner/tabs/SettingsTab.tsx", "r") as f:
    text = f.read()

# Add providers state
state_target = r"const \[savingSeguranca, setSavingSeguranca\] = useState\(false\);"
new_state = """const [savingSeguranca, setSavingSeguranca] = useState(false);
  const [providers, setProviders] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.app_metadata?.providers) {
        setProviders(data.user.app_metadata.providers);
      }
    });
  }, []);"""
text = text.replace(state_target, new_state)

# Update security tab UI
ui_target = r"""              <form onSubmit=\{handleSaveSeguranca\} className="space-y-6">"""
new_ui = """              {providers.includes('google') ? (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-bold text-purple-800">A sua conta é gerida de forma segura pelo Google.</span>
                </div>
              ) : (
              <form onSubmit={handleSaveSeguranca} className="space-y-6">"""

text = re.sub(ui_target, new_ui, text)

# Close the newly added conditional rendering
ui_end_target = r"""                  <button type="submit" disabled=\{savingSeguranca\} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2">
                    \{savingSeguranca \? <Check className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />\} \{savingSeguranca \? "A Guardar\.\.\." : "Atualizar Password"\}
                  </button>
                </div>
              </form>"""
new_ui_end = """                  <button type="submit" disabled={savingSeguranca} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2">
                    {savingSeguranca ? <Check className="w-4 h-4 animate-pulse" /> : <Save className="w-4 h-4" />} {savingSeguranca ? "A Guardar..." : "Atualizar Password"}
                  </button>
                </div>
              </form>
              )}"""
text = re.sub(ui_end_target, new_ui_end, text)

with open("src/pages/partner/tabs/SettingsTab.tsx", "w") as f:
    f.write(text)
