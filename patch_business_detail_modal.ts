import fs from 'fs';
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

const targetModalRender = `{/* AVALIAÇÕES RECUPERADAS */}`;

const replacementModalRender = `{/* AVALIAÇÕES RECUPERADAS */}
              {/* Modal Foto Expandida */}
              {expandedPhoto && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setExpandedPhoto(null)}>
                  <button className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                  <img src={expandedPhoto} className="max-w-full max-h-[90vh] object-contain rounded-xl" alt="Expanded review" onClick={(e) => e.stopPropagation()} />
                </div>
              )}`;

content = content.replace(targetModalRender, replacementModalRender);
fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
