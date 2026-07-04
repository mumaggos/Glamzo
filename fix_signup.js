import fs from 'fs';

let content = fs.readFileSync('src/pages/Signup.tsx', 'utf-8');

const regex = /<\/button>\s*<\/div>\s*<\/form>\s*\)\s*:\s*\(\s*<form className="space-y-4" onSubmit=\{handleRegister\}>[\s\S]*?<\/form>\s*\)/m;

const replacement = `</button>
                </div>
              </fieldset>
              
              {step === 'verify' && (
                <div className="mt-6 p-5 bg-rose-50/50 border border-rose-100 rounded-2xl animate-fade-in">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                       <h4 className="font-bold text-slate-800 text-sm">Verifique o seu e-mail e Spam</h4>
                       <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                         Enviámos um código para <strong>{email}</strong>. Por vezes pode ir parar à pasta de Spam ou Lixo.
                       </p>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="verify-code" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 text-center">
                      Insira o Código de Verificação
                    </label>
                    <input
                      id="verify-code"
                      type="text"
                      required
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value)}
                      className="block w-full px-4 py-4 border border-slate-200 bg-white rounded-xl text-center text-2xl font-mono tracking-[0.2em] sm:tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 transition-all text-slate-800"
                      placeholder="00000000"
                      maxLength={8}
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading || enteredCode.length < 6}
                      className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 gap-2 items-center cursor-pointer shadow-md shadow-emerald-100"
                      id="btn-submit-verify"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>A verificar...</span>
                        </>
                      ) : (
                        <span>Verificar e Entrar</span>
                      )}
                    </button>
                    <div className="flex flex-col gap-2 mt-3">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleResendOtp}
                        className="w-full py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
                      >
                        Reenviar novo código
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStep('form');
                          setEnteredCode('');
                        }}
                        className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 font-medium"
                      >
                        Corrigir dados
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/pages/Signup.tsx', content);
