import fs from 'fs';
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

// Update input logic
const targetInput = `      const input = {
        business_id: business.id,
        customer_id: user.id,
        customer_name: author,
        rating: newReviewRating,
        comment: newReviewComment,
        service_id: null,
        service_name: newReviewService || 'Geral',
        image_urls: uploadedUrls.length > 0 ? uploadedUrls : null
      };`;
const replaceInput = `      const input = {
        business_id: business.id,
        customer_id: user.id,
        customer_name: author,
        rating: newReviewRating,
        comment: newReviewComment || '',
        service_id: null,
        service_name: newReviewService || 'Geral',
        image_urls: uploadedUrls.length > 0 ? uploadedUrls : null
      };`;
content = content.replace(targetInput, replaceInput);

// Remove 'required' from select and textarea
const targetSelect = `<select required value={newReviewService} onChange={(e) => setNewReviewService(e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-purple-500">`;
const replaceSelect = `<select value={newReviewService} onChange={(e) => setNewReviewService(e.target.value)} className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-purple-500">`;
content = content.replace(targetSelect, replaceSelect);

const targetTextarea = `<textarea required placeholder="Como foi o atendimento?" rows={3} value={newReviewComment} onChange={(e) => setNewReviewComment(e.target.value)} className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-purple-500" />`;
const replaceTextarea = `<textarea placeholder="Como foi o atendimento? (Opcional)" rows={3} value={newReviewComment} onChange={(e) => setNewReviewComment(e.target.value)} className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-purple-500" />`;
content = content.replace(targetTextarea, replaceTextarea);

fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
