import fs from 'fs';
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

const targetFilters = `{reviewFormOpen && (`;

const replacementFilters = `
                {reviews.length > 0 && !loadingReviews && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                      <button onClick={() => setReviewFilterRating(null)} className={\`shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors \${reviewFilterRating === null ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}\`}>Todas</button>
                      {[5, 4, 3, 2, 1].map(star => (
                        <button key={star} onClick={() => setReviewFilterRating(star)} className={\`shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 \${reviewFilterRating === star ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}\`}>
                          <span>{star}</span><Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                      ))}
                    </div>
                    <select 
                      value={reviewSortOrder} 
                      onChange={(e) => setReviewSortOrder(e.target.value as any)}
                      className="text-xs p-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-purple-500"
                    >
                      <option value="recent">Mais recentes</option>
                      <option value="highest">Melhor pontuação</option>
                      <option value="lowest">Pior pontuação</option>
                    </select>
                  </div>
                )}
                
                {reviewFormOpen && (`;

content = content.replace(targetFilters, replacementFilters);

const targetRender = `                {loadingReviews ? (
                  <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 text-purple-400 animate-spin" /></div>
                ) : reviews.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {reviews.map((r) => (
                      <div key={r.id} className="py-5 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <span className="font-bold text-slate-800 text-sm block">{r.customer_name}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-500 font-medium">Serviço: <span className="font-semibold text-purple-600">{r.service_name}</span></span>
                              <span className="text-[10px] text-slate-400">•</span>
                              <span className="text-[10px] text-slate-500 font-medium">⭐ {r.customer_stats?.total_reviews || 1} Avaliações</span>
                              <span className="text-[10px] text-slate-400">•</span>
                              <span className="text-[10px] text-slate-500 font-medium">📷 {r.customer_stats?.total_photos || (r.image_urls?.length || 0)} Fotos</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={\`w-3.5 h-3.5 \${star <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}\`} />))}
                          </div>
                        </div>
                        <p className="text-slate-600 mt-3 text-xs leading-relaxed">{r.comment}</p>
                        
                        {r.image_urls && r.image_urls.length > 0 && (
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100"><MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" /><p className="text-xs text-slate-500">Sem avaliações. Seja o primeiro a opinar!</p></div>
                )}`;

const replacementRender = `                {loadingReviews ? (
                  <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 text-purple-400 animate-spin" /></div>
                ) : reviews.length > 0 ? (
                  <>
                    <div className="divide-y divide-slate-100">
                      {reviews
                        .filter(r => reviewFilterRating === null || r.rating === reviewFilterRating)
                        .sort((a, b) => {
                          if (reviewSortOrder === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                          if (reviewSortOrder === 'highest') return b.rating - a.rating;
                          if (reviewSortOrder === 'lowest') return a.rating - b.rating;
                          return 0;
                        })
                        .slice(0, showAllReviews ? undefined : 3)
                        .map((r) => (
                        <div key={r.id} className="py-5 first:pt-0 last:pb-0">
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <span className="font-bold text-slate-800 text-sm block">{r.customer_name}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                {r.service_name && <><span className="text-[10px] text-slate-500 font-medium">Serviço: <span className="font-semibold text-purple-600">{r.service_name}</span></span><span className="text-[10px] text-slate-400">•</span></>}
                                <span className="text-[10px] text-slate-500 font-medium">⭐ {r.customer_stats?.total_reviews || 1} Avaliações</span>
                                <span className="text-[10px] text-slate-400">•</span>
                                <span className="text-[10px] text-slate-500 font-medium">📷 {r.customer_stats?.total_photos || (r.image_urls?.length || 0)} Fotos</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={\`w-3.5 h-3.5 \${star <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}\`} />))}
                            </div>
                          </div>
                          {r.comment && <p className="text-slate-600 mt-3 text-xs leading-relaxed">{r.comment}</p>}
                          
                          {r.image_urls && r.image_urls.length > 0 && (
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
                        </div>
                      ))}
                    </div>
                    {reviews.filter(r => reviewFilterRating === null || r.rating === reviewFilterRating).length === 0 && (
                       <div className="text-center py-6 text-slate-500 text-xs">Nenhuma avaliação encontrada com este filtro.</div>
                    )}
                    {reviews.filter(r => reviewFilterRating === null || r.rating === reviewFilterRating).length > 3 && !showAllReviews && (
                      <div className="mt-2 pt-4 border-t border-slate-100 flex justify-center">
                        <button onClick={() => setShowAllReviews(true)} className="text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors">
                          Ver todas as {reviews.filter(r => reviewFilterRating === null || r.rating === reviewFilterRating).length} avaliações
                        </button>
                      </div>
                    )}
                    {showAllReviews && (
                       <div className="mt-2 pt-4 border-t border-slate-100 flex justify-center">
                         <button onClick={() => setShowAllReviews(false)} className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors">
                           Mostrar menos
                         </button>
                       </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100"><MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" /><p className="text-xs text-slate-500">Sem avaliações. Seja o primeiro a opinar!</p></div>
                )}`;

content = content.replace(targetRender, replacementRender);

fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
