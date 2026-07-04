import fs from 'fs';
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const regex = /const qStem = q\.endsWith\('s'\) \? q\.slice\(0, -1\) : q;/;
const newStem = `const qStem = q.endsWith('s') ? q.slice(0, -1) : q;
       const aliases: Record<string, string[]> = {
         'unha': ['nail', 'unha'],
         'nail': ['nail', 'unha'],
         'cabel': ['cabel', 'hair', 'barb'],
         'barb': ['barb', 'cabel', 'hair'],
         'maquilh': ['maquilh', 'makeup', 'make up'],
         'makeup': ['maquilh', 'makeup', 'make up'],
         'pestana': ['pestana', 'lash'],
         'lash': ['pestana', 'lash']
       };
       let searchTerms = [qStem, q];
       for (const key of Object.keys(aliases)) {
         if (qStem.includes(key)) {
           searchTerms = [...searchTerms, ...aliases[key]];
         }
       }`;

const checkLogicRegex = /if \(bCat\.includes\(qStem\) \|\| bName\.includes\(qStem\) \|\| bDesc\.includes\(qStem\) \|\| bCity\.includes\(qStem\)\) return true;\s*if \(b\.services && b\.services\.length > 0\) \{\s*return b\.services\.some\(\(s: any\) => \{\s*const sName = normalize\(s\.name\);\s*const sDesc = normalize\(s\.description\);\s*return sName\.includes\(qStem\) \|\| sDesc\.includes\(qStem\);\s*\}\);\s*\}/;

const newCheckLogic = `const matchesAny = (text: string) => searchTerms.some(term => text.includes(term));
       if (matchesAny(bCat) || matchesAny(bName) || matchesAny(bDesc) || matchesAny(bCity)) return true;
       
       if (b.services && b.services.length > 0) {
         return b.services.some((s: any) => {
           return matchesAny(normalize(s.name)) || matchesAny(normalize(s.description));
         });
       }`;

content = content.replace(regex, newStem);
content = content.replace(checkLogicRegex, newCheckLogic);
fs.writeFileSync('src/pages/Home.tsx', content);

