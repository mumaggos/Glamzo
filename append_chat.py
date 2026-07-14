import re

with open("src/components/UniversalDisputes.tsx", "r") as f:
    text = f.read()

target = r"""<div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-6">
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">\{selectedDispute\.reason\}</p>
              </div>"""

replacement = """<div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-6">
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedDispute.reason}</p>
              </div>
              
              <div className="border-t border-slate-100 pt-6 mb-6">
                <h5 className="font-bold text-xs text-slate-900 uppercase tracking-widest mb-3">Histórico do Caso</h5>
                <div className="bg-slate-50 rounded-2xl p-4 h-64 overflow-y-auto mb-4 border border-slate-200 flex flex-col gap-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-slate-400 text-xs py-8 font-medium">Nenhuma mensagem neste caso.</div>
                  ) : (
                    messages.map(msg => {
                      const isMe = msg.sender_type === myType;
                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${isMe ? 'self-end' : 'self-start'}`}>
                          <div className={`px-3 py-2 rounded-2xl text-xs shadow-sm ${
                            isMe ? 'bg-purple-600 text-white rounded-tr-sm' : 
                            msg.sender_type === 'admin' ? 'bg-rose-100 text-rose-900 rounded-tl-sm border border-rose-200' :
                            'bg-white text-slate-800 rounded-tl-sm border border-slate-200'
                          }`}>
                            <span className="block text-[9px] font-bold opacity-75 mb-0.5 uppercase tracking-wider">{msg.sender_type === myType ? 'Você' : msg.sender_type}</span>
                            {msg.content}
                            {msg.file_url && (
                              <a href={msg.file_url} target="_blank" rel="noreferrer" className="block mt-2">
                                <img loading="lazy" src={msg.file_url} alt="Anexo" className="rounded-lg max-h-32 object-cover" />
                              </a>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">{new Date(msg.created_at).toLocaleTimeString('pt-PT')}</span>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                {selectedDispute.status !== 'resolved' && selectedDispute.status !== 'refunded' && (
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <label className="shrink-0 p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl cursor-pointer transition-colors border border-slate-200 flex items-center justify-center">
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Escrever mensagem..."
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:border-purple-500 outline-none"
                    />
                    <button type="submit" disabled={!newMessage.trim()} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-3 rounded-xl transition-colors shadow-sm">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>"""

text = re.sub(target, replacement, text)

with open("src/components/UniversalDisputes.tsx", "w") as f:
    f.write(text)
