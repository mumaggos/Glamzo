import fs from 'fs';

let content = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf-8');

// Find the form in step 1
const insertionPoint = `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Nome do Estabelecimento
                  </label>`;

const newUI = `
                {/* Imagens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Foto de Perfil (Logótipo)</label>
                     <div className="flex items-center gap-4">
                       <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                         {logoUrl ? <img src={logoUrl} className="w-full h-full object-cover" /> : <Building2 className="w-6 h-6 text-slate-400" />}
                       </div>
                       <label className="cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                         {uploadingImage ? 'A enviar...' : 'Escolher Foto'}
                         <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && uploadImage(e.target.files[0], 'avatars', setLogoUrl)} disabled={uploadingImage} />
                       </label>
                     </div>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Foto de Capa</label>
                     <div className="flex items-center gap-4">
                       <div className="w-24 h-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                         {coverUrl ? <img src={coverUrl} className="w-full h-full object-cover" /> : <div className="text-slate-400 text-xs">Sem capa</div>}
                       </div>
                       <label className="cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                         {uploadingImage ? 'A enviar...' : 'Escolher Capa'}
                         <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && uploadImage(e.target.files[0], 'business-images', setCoverUrl)} disabled={uploadingImage} />
                       </label>
                     </div>
                   </div>
                </div>

                {/* Categoria */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Categoria Principal</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all text-slate-800"
                  >
                    {MAIN_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.emoji} {cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Nome do Estabelecimento
                  </label>
`;

content = content.replace(insertionPoint, newUI);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', content);

