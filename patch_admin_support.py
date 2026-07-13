import re

with open("src/pages/Admin.tsx", "r") as f:
    content = f.read()

replacement = """                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Users List */}
                    <div className="md:col-span-1 bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 space-y-4 max-h-[600px] overflow-y-auto">
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5 font-mono mb-4">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span>Conversas Abertas</span>
                      </h4>
                      <div className="space-y-2">
                        {Object.values(
                          supportChats.reduce((acc: any, msg: any) => {
                            if (!acc[msg.user_id]) {
                              acc[msg.user_id] = { user_id: msg.user_id, user: msg.profiles, messages: [], last_active: msg.created_at };
                            }
                            acc[msg.user_id].messages.push(msg);
                            return acc;
                          }, {})
                        ).map((chat: any) => (
                          <button
                            key={chat.user_id}
                            onClick={() => setSelectedSupportUser(chat.user_id)}
                            className={`w-full text-left p-3 rounded-xl border transition-all ${selectedSupportUser === chat.user_id ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                          >
                            <span className="block font-bold text-xs text-slate-900 truncate">{chat.user?.full_name || 'Utilizador Desconhecido'}</span>
                            <span className="block text-[10px] text-slate-500 font-mono mt-0.5 truncate">{chat.user?.email || 'N/A'}</span>
                          </button>
                        ))}
                        {supportChats.length === 0 && (
                          <p className="text-[10px] text-slate-500 italic text-center py-4">Nenhuma mensagem encontrada.</p>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Chat Window */}
                    <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 flex flex-col h-[600px]">
                      {selectedSupportUser ? (
                        <>
                          <div className="border-b border-slate-200 pb-4 mb-4">
                            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-purple-600" />
                              <span>Inbox: Histórico de Conversa</span>
                            </h4>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                            {supportChats
                              .filter(m => m.user_id === selectedSupportUser)
                              .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                              .map(msg => {
                                const isAdmin = msg.sender_role === 'admin';
                                return (
                                  <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-xl p-3 text-xs ${isAdmin ? 'bg-purple-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                                      <p className="whitespace-pre-wrap">{msg.content}</p>
                                      <span className={`block text-[9px] mt-1.5 font-mono ${isAdmin ? 'text-purple-200' : 'text-slate-400'}`}>
                                        {new Date(msg.created_at).toLocaleString('pt-PT')}
                                      </span>
                                    </div>
                                  </div>
                                );
                            })}
                          </div>
                          
                          <div className="pt-4 border-t border-slate-200 flex gap-2">
                            <input
                              type="text"
                              value={supportInput}
                              onChange={(e) => setSupportInput(e.target.value)}
                              onKeyDown={async (e) => {
                                if (e.key === 'Enter' && supportInput.trim()) {
                                  const { error } = await supabase.from('support_messages').insert({
                                    user_id: selectedSupportUser,
                                    sender_role: 'admin',
                                    content: supportInput.trim()
                                  });
                                  if (!error) {
                                    setSupportInput('');
                                    const { data } = await supabase.from('support_messages').select('*, profiles:user_id(id, full_name, email, role, avatar_url)').order('created_at', { ascending: true });
                                    if (data) setSupportChats(data);
                                  }
                                }
                              }}
                              placeholder="Escreva a sua resposta..."
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 outline-none focus:border-purple-600 focus:bg-white transition-all"
                            />
                            <button
                              onClick={async () => {
                                if (supportInput.trim()) {
                                  const { error } = await supabase.from('support_messages').insert({
                                    user_id: selectedSupportUser,
                                    sender_role: 'admin',
                                    content: supportInput.trim()
                                  });
                                  if (!error) {
                                    setSupportInput('');
                                    const { data } = await supabase.from('support_messages').select('*, profiles:user_id(id, full_name, email, role, avatar_url)').order('created_at', { ascending: true });
                                    if (data) setSupportChats(data);
                                  }
                                }
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center shrink-0"
                            >
                              Enviar
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                          <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                          <p className="text-xs font-mono">Selecione uma conversa para começar a responder.</p>
                        </div>
                      )}
                    </div>
                  </div>"""

content = re.sub(
    r"\{\/\* Disputes segment \*\/\}.*?Parabéns\! Fila de suporte limpa\. Sem chamados ativos\.\n\s+<\/div>\n\s+\)}",
    replacement,
    content,
    flags=re.DOTALL
)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(content)

print("Patched support inbox")
