const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

// 1. Add setupByGlamzo state
const statePattern = /const \[services, setServices\] = useState<any\[\]>\(\[\]\);/;
code = code.replace(statePattern, `const [services, setServices] = useState<any[]>([]);\n  const [setupByGlamzo, setSetupByGlamzo] = useState(false);`);

// 2. Add X button to services map
const servicePill = `                  <div className="font-black text-slate-900">{s.price}€</div>
                </div>`;
const newServicePill = `                  <div className="flex items-center gap-4">
                    <div className="font-black text-slate-900">{s.price}€</div>
                    <button 
                      onClick={async () => {
                        const { error } = await supabase.from('services').delete().eq('id', s.id);
                        if (!error) {
                           setServices(services.filter(svc => svc.id !== s.id));
                        } else {
                           setErrorMsg('Erro ao remover serviço: ' + error.message);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remover serviço"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>`;
code = code.replace(servicePill, newServicePill);

// 3. Update handleNext validation
const nextVal = `    } else if (step === 3) {
      if (services.length === 0) {
        setErrorMsg('Adicione pelo menos um serviço para prosseguir.');
        return;
      }`;
const newNextVal = `    } else if (step === 3) {
      if (services.length === 0 && !setupByGlamzo) {
        setErrorMsg('Adicione pelo menos um serviço ou selecione "A Glamzo configura por mim" para prosseguir.');
        return;
      }`;
code = code.replace(nextVal, newNextVal);

// 4. Upsert setupByGlamzo
const upsertMatch = `          onboarding_step: 3,
          setup_step: 4
        });`;
const newUpsertMatch = `          onboarding_step: 3,
          setup_step: 4,
          manual_setup_requested: setupByGlamzo || business.manual_setup_requested
        });`;
code = code.replace(upsertMatch, newUpsertMatch);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
console.log('SetupWizard step 1 patched.');
