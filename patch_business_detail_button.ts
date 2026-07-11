import fs from 'fs';
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

const targetBtn = `<button onClick={() => { if (!user) { navigate(\`/login?redirect=\${encodeURIComponent(location.pathname)}\`); return; } setReviewFormOpen(!reviewFormOpen); }} className="px-4 py-2 bg-purple-50 text-purple-600 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer">`;

const replacementBtn = `<button onClick={() => { 
  if (!user) { 
    localStorage.setItem('returnTo', location.pathname + location.search);
    navigate('/login'); 
    return; 
  } 
  setReviewFormOpen(!reviewFormOpen); 
}} className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer">`;

content = content.replace(targetBtn, replacementBtn);
fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
