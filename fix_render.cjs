const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

// The error is because I messed up the JSX.
// Let's find `{step === 4 && (` and replace everything down to the end.
const step4Start = code.indexOf('{step === 4 && (');
const closingTags = `
      </div>
    </div>
    </APIProvider>
  );
}
`;

const newRender = `{step === 4 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Plano Pro</h2>
            
            <div className="grid grid-cols-1 gap-6 mb-8">
              <div className="relative p-6 rounded-2xl border-2 border-purple-600 bg-purple-50/50 shadow-md">
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">
                  Recomendado
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <input type="radio" checked={true} readOnly className="w-5 h-5 text-purple-600 border-slate-300 focus:ring-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Apenas Software (14 dias grátis)
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">29€ / mês ou 299€ / ano após período grátis. Acesso total a todas as funcionalidades do Glamzo Business.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <button
                type="button"
                onClick={() => updateSetupStep(3)}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleNext}
                className="w-full px-6 py-3.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md flex items-center justify-center gap-2 flex-1"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Começar 14 Dias Grátis</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6 text-center tracking-tight">{t('setupWizard.allReadyTitle')}</h2>
            <div className="max-w-md mx-auto space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 rounded-xl border bg-emerald-50 border-emerald-200">
                  <span className="font-semibold text-sm text-emerald-900">{t('setupWizard.storeDataStep')}</span>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-emerald-50 border-emerald-200">
                  <span className="font-semibold text-sm text-emerald-900">{t('setupWizard.servicesStep')}</span>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-emerald-50 border-emerald-200">
                  <span className="font-semibold text-sm text-emerald-900">{t('setupWizard.subscribedPlanStep')}</span>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
            </div>
            <div className="text-center">
              <button
                onClick={publishBusiness}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 text-white rounded-xl font-black text-lg uppercase tracking-widest transition-all shadow-xl shadow-purple-900/20 inline-flex items-center gap-3"
              >
                <span>{t('setupWizard.finishSetupBtn')}</span>
                <Sparkles className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {step < 5 && (
          <div className="mt-8 flex items-center gap-4">
             {step > 1 && step !== 4 && (
                <button
                  type="button"
                  onClick={() => updateSetupStep(step - 1)}
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2 w-full max-w-[200px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('setupWizard.backBtn')}</span>
                </button>
             )}
            
            {step !== 4 && (
              <button
                type="button"
                disabled={loading}
                onClick={handleNext}
                className="px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md flex items-center justify-center gap-2 flex-1"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>{step === 3 ? t('setupWizard.signPlan') : t('setupWizard.proceedBtn')}</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
    </APIProvider>
  );
}
`;

code = code.slice(0, step4Start) + newRender;
fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
