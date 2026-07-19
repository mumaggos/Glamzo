const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

const targetStr = `              <button 
                onClick={async () => {
                  const name = (document.getElementById('new-svc-name') as HTMLInputElement).value;`;

const newStr = `              <div className="mt-8 mb-2 p-4 border border-purple-200 bg-purple-50 rounded-xl flex items-center gap-3 cursor-pointer" onClick={() => setSetupByGlamzo(!setupByGlamzo)}>
                <div className={\`w-5 h-5 rounded border flex items-center justify-center \${setupByGlamzo ? 'bg-purple-600 border-purple-600' : 'bg-white border-slate-300'}\`}>
                  {setupByGlamzo && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex flex-col">
                   <span className="text-sm font-bold text-purple-900">A Glamzo configura por mim</span>
                   <span className="text-xs text-purple-700">Não quer perder tempo? Nós adicionamos os seus serviços.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (`;

// Wait, the target is at the end of step 3. 
const realTarget = `              </button>
            </div>
          </div>
        )}`;

code = code.replace(realTarget, `              </button>
            </div>
            
            <div className="mt-6 p-4 border border-purple-200 bg-purple-50 rounded-xl flex items-center gap-3 cursor-pointer" onClick={() => setSetupByGlamzo(!setupByGlamzo)}>
              <div className={\`w-5 h-5 rounded border flex items-center justify-center \${setupByGlamzo ? 'bg-purple-600 border-purple-600' : 'bg-white border-slate-300'}\`}>
                {setupByGlamzo && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex flex-col">
                 <span className="text-sm font-bold text-purple-900">A Glamzo configura por mim</span>
                 <span className="text-xs text-purple-700">Não quer perder tempo? Nós adicionamos os seus serviços gratuitamente.</span>
              </div>
            </div>
          </div>
        )}`);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
console.log('SetupWizard step 2 patched.');
