import re

with open("src/pages/Account.tsx", "r") as f:
    text = f.read()

# Add states for security
state_target = r"const \[successMsg, setSuccessMsg\] = useState<string \| null>\(null\);"
new_state = """const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [providers, setProviders] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{type: 'error' | 'success', text: string} | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.app_metadata?.providers) {
        setProviders(data.user.app_metadata.providers);
      }
    });
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'A password deve ter pelo menos 6 caracteres.' });
      return;
    }
    setSavingPassword(true);
    setPasswordMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordMsg({ type: 'success', text: 'Password atualizada com sucesso.' });
      setNewPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Erro ao atualizar password.' });
    } finally {
      setSavingPassword(false);
    }
  };
"""
text = text.replace(state_target, new_state)

# Add the security section
form_target = r"""              <button type="submit" disabled=\{submitting\} className="px-8 py-3\.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-md disabled:opacity-50 flex items-center gap-2">
                \{submitting \? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />\} Salvar Alterações
              </button>
            </form>"""

new_form = """              <button type="submit" disabled={submitting} className="px-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-md disabled:opacity-50 flex items-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar Alterações
              </button>
            </form>
            
            <div className="mt-12 pt-8 border-t border-slate-200/60">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><KeyRound className="w-5 h-5 text-purple-600" /> Segurança e Autenticação</h3>
              {providers.includes('google') ? (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-bold text-purple-800">A sua conta é gerida de forma segura pelo Google.</span>
                </div>
              ) : (
                <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-sm">
                  {passwordMsg && (
                    <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${passwordMsg.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {passwordMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      {passwordMsg.text}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nova Password</label>
                    <input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 bg-slate-50 focus:bg-white transition-all font-medium text-slate-900" placeholder="••••••••" />
                  </div>
                  <button type="submit" disabled={savingPassword} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-md">
                    {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Atualizar Password
                  </button>
                </form>
              )}
            </div>"""

text = re.sub(form_target, new_form, text)

# Ensure KeyRound is imported
if "KeyRound" not in text:
    text = text.replace("import { User,", "import { User, KeyRound,")

with open("src/pages/Account.tsx", "w") as f:
    f.write(text)
