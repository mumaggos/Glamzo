import re

with open("src/pages/Admin.tsx", "r") as f:
    text = f.read()

# Make sure imports are there
if "UniversalInbox" not in text:
    text = text.replace("import React,", "import React,\nimport UniversalInbox from '../components/UniversalInbox';\nimport UniversalDisputes from '../components/UniversalDisputes';\n")

target_start_str = "              {activeTab === 'support' && ("
target_end_str = "              {/* ===================================================="

start_idx = text.find(target_start_str)
end_idx = text.find(target_end_str)

if start_idx != -1 and end_idx != -1:
    new_support_block = """              {activeTab === 'support' && (
                <div id="admin-support" className="space-y-6 animate-fade-in w-full">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Centro de Resolução e Apoio</h3>
                      <p className="text-xs text-slate-600 mt-0.5">Comunique-se com clientes ou parceiros. Avalie disputas e conflitos.</p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => setSupportSubTab('messages')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${supportSubTab === 'messages' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        Mensagens
                      </button>
                      <button
                        onClick={() => setSupportSubTab('disputes')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${supportSubTab === 'disputes' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-600 hover:text-slate-900'}`}
                      >
                        Disputas
                        {disputes.filter(d => d.status === 'open' || d.status === 'in_review').length > 0 && (
                          <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{disputes.filter(d => d.status === 'open' || d.status === 'in_review').length}</span>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {supportSubTab === 'messages' && <UniversalInbox myId="admin" myType="admin" />}
                  {supportSubTab === 'disputes' && <UniversalDisputes myId="admin" myType="admin" />}
                </div>
              )}
"""
    text = text[:start_idx] + new_support_block + text[end_idx:]

with open("src/pages/Admin.tsx", "w") as f:
    f.write(text)
