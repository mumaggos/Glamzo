import fs from 'fs';

let content = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf-8');

if (!content.includes('SUBCATEGORIES_BY_MAIN')) {
  content = content.replace(
    "import { MAIN_CATEGORIES }",
    "import { MAIN_CATEGORIES, SUBCATEGORIES_BY_MAIN }"
  );
}

// Add select dropdown for subcategory
const oldInputs = `              <div className="space-y-4">
                <div>
                  <input id="new-svc-name" type="text" placeholder="Nome do Serviço" className="px-3 py-2 border border-slate-300 rounded text-sm w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input id="new-svc-duration" type="number" placeholder="Duração (min)" className="px-3 py-2 border border-slate-300 rounded text-sm w-full" />
                  <input id="new-svc-price" type="number" step="0.01" placeholder="Preço (€)" className="px-3 py-2 border border-slate-300 rounded text-sm w-full" />
                </div>
              </div>`;

const newInputs = `              <div className="space-y-4">
                <div>
                  <input id="new-svc-name" type="text" placeholder="Nome do Serviço" className="px-3 py-2 border border-slate-300 rounded text-sm w-full" />
                </div>
                <div>
                  <select id="new-svc-cat" className="px-3 py-2 border border-slate-300 rounded text-sm w-full bg-white">
                    <option value="">Selecione o Tipo de Serviço (Opcional)</option>
                    {(SUBCATEGORIES_BY_MAIN[category] || []).map((sub: string) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input id="new-svc-duration" type="number" placeholder="Duração (min)" className="px-3 py-2 border border-slate-300 rounded text-sm w-full" />
                  <input id="new-svc-price" type="number" step="0.01" placeholder="Preço (€)" className="px-3 py-2 border border-slate-300 rounded text-sm w-full" />
                </div>
              </div>`;

content = content.replace(oldInputs, newInputs);

// Modify the click handler to save the subcategory
const oldSave = `                  const name = (document.getElementById('new-svc-name') as HTMLInputElement).value;
                  const duration = parseInt((document.getElementById('new-svc-duration') as HTMLInputElement).value);
                  const price = parseFloat((document.getElementById('new-svc-price') as HTMLInputElement).value);
                  if (!name || !duration || !price) return;
                  
                  try {
                    const { data, error } = await supabase.from('services').insert({
                      business_id: business.id,
                      name,
                      duration_minutes: duration,
                      price,
                      is_active: true
                    }).select().single();`;

const newSave = `                  const name = (document.getElementById('new-svc-name') as HTMLInputElement).value;
                  const duration = parseInt((document.getElementById('new-svc-duration') as HTMLInputElement).value);
                  const price = parseFloat((document.getElementById('new-svc-price') as HTMLInputElement).value);
                  const subcat = (document.getElementById('new-svc-cat') as HTMLSelectElement).value;
                  if (!name || !duration || !price) return;
                  
                  try {
                    const { data, error } = await supabase.from('services').insert({
                      business_id: business.id,
                      name,
                      description: subcat, // use description to store the global subcategory temporarily or tags
                      duration_minutes: duration,
                      price,
                      is_active: true
                    }).select().single();`;

content = content.replace(oldSave, newSave);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', content);

