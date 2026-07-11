import fs from 'fs';
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

// Replace state
content = content.replace(
  'const [newReviewFileBlob, setNewReviewFileBlob] = useState<string | null>(null);',
  'const [reviewPhotos, setReviewPhotos] = useState<File[]>([]);\n  const [uploadingPhotos, setUploadingPhotos] = useState(false);\n  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);'
);

// Replace handleCreateReviewSubmit
const targetSubmit = `  const handleCreateReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast('Por favor, inicie sessão para enviar uma avaliação.');
      navigate(\`/login?redirect=\${encodeURIComponent(location.pathname)}\`);
      return;
    }
    if (!business?.id) return;
    setSubmittingReview(true);
    try {
      const author = profile?.full_name || user.email?.split('@')[0] || 'Cliente Glamzo';
      const input = {
        business_id: business.id,
        customer_id: user.id,
        rating: newReviewRating,
        comment: newReviewComment,
      };
      const created = await submitReview(input as any);
      setReviews(prev => [created, ...prev]);
      setNewReviewComment(''); setNewReviewService(''); setNewReviewFileBlob(null); setReviewFormOpen(false);
      toast('Avaliação submetida com sucesso! Obrigado.');
    } catch (e) {
      toast('Falha ao registar a avaliação.');
    } finally {
      setSubmittingReview(false);
    }
  };`;

const replacementSubmit = `  const handlePhotoSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setReviewPhotos(Array.from(e.target.files).slice(0, 5)); // Limit to 5 photos
    }
  };

  const handleCreateReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      localStorage.setItem('returnTo', location.pathname + location.search);
      navigate('/login');
      return;
    }
    if (!business?.id) return;
    setSubmittingReview(true);
    try {
      let uploadedUrls: string[] = [];
      if (reviewPhotos.length > 0) {
        setUploadingPhotos(true);
        for (const file of reviewPhotos) {
          const fileExt = file.name.split('.').pop();
          const fileName = \`\${Math.random()}.\${fileExt}\`;
          const filePath = \`\${user.id}/\${fileName}\`;
          
          const { error: uploadError, data } = await supabase.storage
            .from('review_photos')
            .upload(filePath, file);
            
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage.from('review_photos').getPublicUrl(filePath);
          uploadedUrls.push(publicUrl);
        }
        setUploadingPhotos(false);
      }

      const author = profile?.full_name || user.email?.split('@')[0] || 'Cliente Glamzo';
      const input = {
        business_id: business.id,
        customer_id: user.id,
        customer_name: author,
        rating: newReviewRating,
        comment: newReviewComment,
        service_id: 'general',
        service_name: newReviewService || 'Geral',
        image_urls: uploadedUrls.length > 0 ? uploadedUrls : null
      };
      const created = await submitReview(input as any);
      // We manually add stats for immediate display
      created.customer_stats = { total_reviews: 1, total_photos: uploadedUrls.length };
      setReviews(prev => [created, ...prev]);
      setNewReviewComment(''); setNewReviewService(''); setReviewPhotos([]); setReviewFormOpen(false);
      toast('Avaliação submetida com sucesso! Obrigado.');
    } catch (e: any) {
      console.error(e);
      toast('Falha ao registar a avaliação: ' + e.message);
    } finally {
      setSubmittingReview(false);
      setUploadingPhotos(false);
    }
  };`;

content = content.replace(targetSubmit, replacementSubmit);

// Replace form area
const targetFormArea = `                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">O seu Comentário</label>
                      <textarea required placeholder="Como foi o atendimento?" rows={3} value={newReviewComment} onChange={(e) => setNewReviewComment(e.target.value)} className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-purple-500" />
                    </div>
                    <div className="flex justify-end pt-2">`;

const replacementFormArea = `                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">O seu Comentário</label>
                      <textarea required placeholder="Como foi o atendimento?" rows={3} value={newReviewComment} onChange={(e) => setNewReviewComment(e.target.value)} className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-purple-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Fotos (Opcional, máx 5)</label>
                      <input type="file" multiple accept="image/*" onChange={handlePhotoSelection} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                      {reviewPhotos.length > 0 && <p className="text-[10px] text-slate-500 mt-1">{reviewPhotos.length} foto(s) selecionada(s)</p>}
                    </div>
                    <div className="flex justify-end pt-2">`;

content = content.replace(targetFormArea, replacementFormArea);

// Replace reviews rendering
const targetReviewsRender = `                  <div className="divide-y divide-slate-100">
                    {reviews.map((r) => (
                      <div key={r.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <span className="font-bold text-slate-800 text-sm block">{r.customer_name}</span>
                            <span className="text-[10px] text-slate-500 font-medium">Serviço: <span className="font-semibold text-purple-600">{r.service_name}</span></span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={\`w-3.5 h-3.5 \${star <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}\`} />))}
                          </div>
                        </div>
                        <p className="text-slate-600 mt-2 text-xs">{r.comment}</p>
                      </div>
                    ))}
                  </div>`;

const replacementReviewsRender = `                  <div className="divide-y divide-slate-100">
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
                  </div>`;

content = content.replace(targetReviewsRender, replacementReviewsRender);

fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
