import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

const search = `    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (b.name || "").toLowerCase().includes(q);
      const matchCat = (b.category || "").toLowerCase().includes(q);
      const matchServices = services.some(s => s.business_id === b.id && s.name.toLowerCase().includes(q));
      if (!matchName && !matchCat && !matchServices) return false;
    }`;

const replace = `    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (b.name || "").toLowerCase().includes(q);
      const matchCat = (b.category || "").toLowerCase().includes(q);
      const matchServices = services.some(s => {
        if (!s || s.business_id !== b.id) return false;
        const sName = s.name || "";
        return sName.toLowerCase().includes(q);
      });
      if (!matchName && !matchCat && !matchServices) return false;
    }`;

content = content.replace(search, replace);

fs.writeFileSync('src/pages/Explore.tsx', content);
