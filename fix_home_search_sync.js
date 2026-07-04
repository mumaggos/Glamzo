import fs from 'fs';
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const startIdx = content.indexOf('  const getFilteredResults = () => {');
const endIdx = content.indexOf('  const searchResults = getFilteredResults();');

if (startIdx !== -1 && endIdx !== -1) {
  const newLogic = `  const getFilteredResults = () => {
    let res = [...businesses];
    
    const normalize = (str: string) => str ? str.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "") : "";
    
    const isMatch = (b: any, term: string) => {
       const q = normalize(term);
       const qStem = q.endsWith('s') ? q.slice(0, -1) : q;
       
       const aliases: Record<string, string[]> = {
         'unha': ['nail', 'unha', 'manic', 'pedic'],
         'nail': ['nail', 'unha', 'manic', 'pedic'],
         'cabel': ['cabel', 'hair', 'barb'],
         'barb': ['barb', 'cabel', 'hair'],
         'maquilh': ['maquilh', 'makeup', 'make up', 'maquiag'],
         'makeup': ['maquilh', 'makeup', 'make up', 'maquiag'],
         'pestana': ['pestana', 'lash', 'cilio'],
         'lash': ['pestana', 'lash', 'cilio'],
         'massag': ['massag', 'massagem', 'massage'],
         'estetic': ['estetic', 'estética']
       };
       let searchTerms = [qStem, q];
       for (const key of Object.keys(aliases)) {
         if (qStem.includes(key)) {
           searchTerms = [...searchTerms, ...aliases[key]];
         }
       }
       
       const bCat = normalize(b.category);
       const bName = normalize(b.name);
       const bDesc = normalize(b.description);
       const bCity = normalize(b.city);
       
       const matchesAny = (text: string) => searchTerms.some(t => text.includes(t));
       if (matchesAny(bCat) || matchesAny(bName) || matchesAny(bDesc) || matchesAny(bCity)) return true;
       
       if (b.services && b.services.length > 0) {
         return b.services.some((s: any) => matchesAny(normalize(s.name)) || matchesAny(normalize(s.description)));
       }
       return false;
    };
    
    if (activeCategory) {
      res = res.filter(b => isMatch(b, activeCategory));
    }
    
    if (searchQuery) {
      res = res.filter(b => isMatch(b, searchQuery));
    }

    if (filterAbertoHoje) res = res.filter(b => b.isOpenNow);
    if (filterTopPartner) res = res.filter(b => b.is_premium || b.is_verified);
    if (filterPromocoes) res = res.filter(b => b.is_promoted);
    
    if (filterMaisPerto && userCoords) res.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    else if (filterMaisBarato) res.sort((a, b) => a.startPrice - b.startPrice);
    else if (filterMelhorAvaliacao) res.sort((a, b) => b.rating - a.rating);

    return res;
  };
`;
  
  content = content.slice(0, startIdx) + newLogic + content.slice(endIdx);
  fs.writeFileSync('src/pages/Home.tsx', content);
} else {
  console.log("Could not find start/end indices");
}

