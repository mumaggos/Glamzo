import fs from 'fs';
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

const targetRender = `                          {r.image_urls && r.image_urls.length > 0 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-2 custom-scrollbar">
                              {r.image_urls.map((url, i) => (
                                <img 
                                  key={i} 
                                  src={url} 
                                  alt="Review photo" 
                                  className="h-20 w-20 object-cover rounded-xl cursor-pointer border border-slate-200 hover:opacity-90 transition-opacity flex-shrink-0"
                                  onClick={() => setExpandedPhoto(url)}
                                />
                              ))}
                            </div>
                          )}`;

const replacementRender = `                          {r.image_urls && r.image_urls.length > 0 && (
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-2 custom-scrollbar">
                              {r.image_urls.map((url, i) => (
                                <img 
                                  key={i} 
                                  src={url} 
                                  alt="Review photo" 
                                  className="h-20 w-20 object-cover rounded-xl cursor-pointer border border-slate-200 hover:opacity-90 transition-opacity flex-shrink-0"
                                  onClick={() => setExpandedPhoto(url)}
                                />
                              ))}
                            </div>
                          )}
                          
                          {r.reply_text && (
                            <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
                              <div className="flex items-center gap-1 mb-1">
                                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Resposta do Proprietário</span>
                              </div>
                              <p className="text-slate-600 text-xs leading-relaxed">{r.reply_text}</p>
                            </div>
                          )}`;

content = content.replace(targetRender, replacementRender);
fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
