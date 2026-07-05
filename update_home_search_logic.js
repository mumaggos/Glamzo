import fs from 'fs';
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const oldSearchLogic = `  const getFilteredResults = () => {
    let res = [...businesses];
    
    if (activeCategory) {
      res = res.filter(b => 
         (b.category && b.category.toLowerCase().includes(activeCategory.toLowerCase())) || 
         (b.description && b.description.toLowerCase().includes(activeCategory.toLowerCase())) ||
         (b.name && b.name.toLowerCase().includes(activeCategory.toLowerCase())) ||
         (b.services && b.services.some((s: any) => s.name && s.name.toLowerCase().includes(activeCategory.toLowerCase()) || (s.description && s.description.toLowerCase().includes(activeCategory.toLowerCase()))))
      );
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      res = res.filter(b => 
         (b.name && b.name.toLowerCase().includes(q)) || 
         (b.city && b.city.toLowerCase().includes(q)) ||
         (b.category && b.category.toLowerCase().includes(q)) || 
         (b.description && b.description.toLowerCase().includes(q)) ||
         (b.services && b.services.some((s: any) => s.name && s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q))))
      );
    }`;

const newSearchLogic = `  const getFilteredResults = () => {
    let res = [...businesses];
    
    const normalize = (str: string) => str ? str.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "") : "";
    
    const isMatch = (b: any, term: string) => {
       const q = normalize(term);
       // Check for exact root matches if we strip plural 's' or use stems
       const qStem = q.endsWith('s') ? q.slice(0, -1) : q;
       
       const bCat = normalize(b.category);
       const bName = normalize(b.name);
       const bDesc = normalize(b.description);
       const bCity = normalize(b.city);
       
       if (bCat.includes(qStem) || bName.includes(qStem) || bDesc.includes(qStem) || bCity.includes(qStem)) return true;
       
       if (b.services && b.services.length > 0) {
         return b.services.some((s: any) => {
           const sName = normalize(s.name);
           const sDesc = normalize(s.description);
           return sName.includes(qStem) || sDesc.includes(qStem);
         });
       }
       return false;
    };
    
    if (activeCategory) {
      res = res.filter(b => isMatch(b, activeCategory));
    }
    
    if (searchQuery) {
      res = res.filter(b => isMatch(b, searchQuery));
    }`;

content = content.replace(oldSearchLogic, newSearchLogic);
fs.writeFileSync('src/pages/Home.tsx', content);

