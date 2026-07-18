const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

// Fix 1: Make successMsg rely on stripe_account_id check
const targetSuccessMsgEffect = `    } else if (status === 'connect_success') {
      setSuccessMsg('Conta de pagamentos associada com sucesso.');
      if (stepParam) {
         setStep(parseInt(stepParam));
      }
      window.history.replaceState({}, document.title, '/partner/setup');`;

const replacementSuccessMsgEffect = `    } else if (status === 'connect_success') {
      if (business && business.stripe_account_id) {
        setSuccessMsg('Conta de pagamentos associada com sucesso.');
      }
      if (stepParam) {
         setStep(parseInt(stepParam));
      }
      window.history.replaceState({}, document.title, '/partner/setup');`;

code = code.replace(targetSuccessMsgEffect, replacementSuccessMsgEffect);

// Fix 2: updateSetupStep(6) for "Configurar mais tarde"
const targetLaterBtn = `<button onClick={() => updateSetupStep(5)} className="text-sm text-slate-500 hover:text-slate-800 underline">
                    Configurar mais tarde
                  </button>`;

const replacementLaterBtn = `<button onClick={() => updateSetupStep(6)} className="text-sm text-slate-500 hover:text-slate-800 underline">
                    Configurar mais tarde
                  </button>`;

code = code.replace(targetLaterBtn, replacementLaterBtn);

// Fix 3: Add "Prosseguir" button inside charges_enabled (or stripe_account_id) block
const targetSuccessBlock = `{business?.charges_enabled ? (
               <div className="p-6 border border-emerald-200 bg-emerald-50 rounded-xl max-w-md mx-auto mb-8">
                 <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                 <h3 className="font-bold text-emerald-900">Configuração Concluída</h3>
                 <p className="text-xs text-emerald-700 mt-2">A sua conta bancária está conectada.</p>
               </div>
            ) : (`;

const replacementSuccessBlock = `{(business?.charges_enabled || business?.stripe_account_id) ? (
               <div className="p-6 border border-emerald-200 bg-emerald-50 rounded-xl max-w-md mx-auto mb-8 flex flex-col items-center">
                 <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                 <h3 className="font-bold text-emerald-900">Configuração Concluída</h3>
                 <p className="text-xs text-emerald-700 mt-2 mb-6">A sua conta bancária está associada.</p>
                 <button
                    onClick={() => updateSetupStep(6)}
                    className="px-8 py-3 bg-[#635BFF] hover:bg-[#5249ea] text-white rounded-xl font-bold uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-3"
                  >
                    <span>Prosseguir</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
               </div>
            ) : (`;

code = code.replace(targetSuccessBlock, replacementSuccessBlock);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
console.log('SetupWizard step 5 patched');
