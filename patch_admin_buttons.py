import re

with open("src/pages/Admin.tsx", "r") as f:
    content = f.read()

replacement = """                            {/* Action Buttons Hub */}
                            <div className="mt-6 border-t border-purple-100 pt-4 space-y-2.5">
                                {/* Row 1 */}
                                <div className="grid grid-cols-2 gap-2">
                                  <a 
                                    href={`/${sal.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="py-2.5 px-3 bg-slate-50 border border-slate-200 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg text-[10px] font-bold text-center uppercase tracking-wider inline-flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
                                    <span>Ver Dados</span>
                                  </a>

                                  <button
                                    type="button"
                                    onClick={() => handleToggleSalonVerification(sal.id, sal.is_verified)}
                                    className="py-2.5 px-3 bg-blue-950/50 hover:bg-blue-900/60 text-blue-300 hover:text-slate-900 border border-blue-900/40 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                                    <span>{sal.is_verified ? "Retirar Selo" : "Verificar Selo"}</span>
                                  </button>
                                </div>

                                {/* Row 2 */}
                                <div className="grid grid-cols-2 gap-2">
                                  {isPro ? (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveProManual(sal.id)}
                                      className="py-2.5 px-3 bg-slate-50 hover:bg-rose-950/20 text-slate-600 hover:text-rose-400 border border-slate-200 hover:border-rose-900/35 rounded-xl text-[10px] font-extrabold uppercase tracking-widest cursor-pointer transition-all animate-fade-in"
                                    >
                                      Remover PRO
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleActivateProManual(sal.id)}
                                      className="py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all shadow-md shadow-purple-950/30"
                                    >
                                      Ativar PRO
                                    </button>
                                  )}

                                  {isSuspended ? (
                                    <button
                                      type="button"
                                      onClick={() => handleReactivatePartner(sal.id)}
                                      className="py-2.5 px-3 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 hover:text-slate-900 border border-emerald-900/40 rounded-xl text-[10px] font-extrabold uppercase tracking-widest cursor-pointer transition-all"
                                    >
                                      Reativar Loja
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleSuspendPartner(sal.id)}
                                      className="py-2.5 px-3 bg-rose-950/55 hover:bg-rose-900/60 text-rose-300 hover:text-slate-900 border border-rose-900/40 rounded-xl text-[10px] font-extrabold uppercase tracking-widest cursor-pointer transition-all"
                                    >
                                      Suspender
                                    </button>
                                  )}
                                </div>

                                {/* Row 3 */}
                                <div className="pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeleteAccountTarget({
                                        ownerId: sal.owner_id,
                                        businessId: sal.id,
                                        name: sal.name
                                      });
                                      setDeleteAccountDoubleConfirmText('');
                                      setDeleteAccountModalOpen(true);
                                    }}
                                    className="w-full py-2.5 bg-rose-950/25 hover:bg-rose-600 text-rose-600 hover:text-slate-900 border border-rose-900/20 hover:border-transparent rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-1.5"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Eliminar Conta</span>
                                  </button>
                                </div>

                              </div>
                            </div>
"""

content = re.sub(
    r"\{\/\* Action Buttons Hub \*\/\}.*?<\/div>\s*<\/div>",
    replacement,
    content,
    flags=re.DOTALL
)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(content)

print("Patched action buttons")
