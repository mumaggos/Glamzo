import fs from 'fs';
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

const targetBtn = `<button type="submit" disabled={submittingReview} className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all">
                        {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Submeter Avaliação
                      </button>`;

const replacementBtn = `<button type="submit" disabled={submittingReview} className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all">
                        {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {uploadingPhotos ? 'A carregar fotos...' : 'Submeter Avaliação'}
                      </button>`;

content = content.replace(targetBtn, replacementBtn);
fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
