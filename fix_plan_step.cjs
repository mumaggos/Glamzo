const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

const step4Start = code.indexOf('{step === 4 && (');
const step5Start = code.indexOf('{step === 5 && (');

if (step4Start !== -1 && step5Start !== -1) {
  const newStep4 = `{step === 4 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Plano Pro</h2>
            
            <div className="grid grid-cols-1 gap-6 mb-8">
              <div className="relative p-6 rounded-2xl border-2 border-purple-600 bg-purple-50/50 shadow-md flex items-start gap-4">
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">
                  Recomendado
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Plano Pro (14 dias grátis)
                  </h3>
                  <p className="text-sm text-slate-600 mt-2">19,90€ / mês após período grátis. Acesso total a todas as funcionalidades do Glamzo Business.</p>
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

        `;

  code = code.substring(0, step4Start) + newStep4 + code.substring(step5Start);
  fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
}
