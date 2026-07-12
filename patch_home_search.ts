import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const search = `  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setQuerySuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      try {
        const q = searchQuery.toLowerCase().trim();
        const matches: any[] = [];
        
        const safeBiz = Array.isArray(businesses) ? businesses : [];
        const safeServ = Array.isArray(servicesData) ? servicesData : [];
        
        // Check businesses
        safeBiz.forEach(b => {
          if (!b) return;
          const bName = b.name || "";
          const bCat = b.category || "";
          if (bName.toLowerCase().includes(q) || bCat.toLowerCase().includes(q)) {
            matches.push({ type: 'business', id: b.id, name: b.name, slug: b.slug, text: b.name });
          }
        });
        
        // Check services
        safeServ.forEach(s => {
          if (!s) return;
          const sName = s.name || "";
          if (sName.toLowerCase().includes(q)) {
            const b = safeBiz.find(bz => bz && bz.id === s.business_id);
            if (b) {
              matches.push({ type: 'service', id: b.id, name: b.name, slug: b.slug, text: \`\${s.name} em \${b.name}\` });
            }
          }
        });
        
        const uniqueMatches = Array.from(new Map(matches.map(m => [m.id + m.text, m])).values());
        setQuerySuggestions(uniqueMatches.slice(0, 5));
      } catch (err) {
        console.error("Search suggestion error:", err);
        setQuerySuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, businesses, servicesData]);`;

const replace = `  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setQuerySuggestions([]);
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    const matches: any[] = [];
    
    const safeBiz = Array.isArray(businesses) ? businesses : [];
    const safeServ = Array.isArray(servicesData) ? servicesData : [];
    
    // Check businesses
    safeBiz.forEach(b => {
      if (!b) return;
      const bName = b.name || "";
      const bCat = b.category || "";
      if (bName.toLowerCase().includes(q) || bCat.toLowerCase().includes(q)) {
        matches.push({ type: 'business', id: b.id, name: b.name, slug: b.slug, text: b.name });
      }
    });
    
    // Check services
    safeServ.forEach(s => {
      if (!s) return;
      const sName = s.name || "";
      if (sName.toLowerCase().includes(q)) {
        const b = safeBiz.find(bz => bz && bz.id === s.business_id);
        if (b) {
          matches.push({ type: 'service', id: b.id, name: b.name, slug: b.slug, text: \`\${s.name} em \${b.name}\` });
        }
      }
    });
    
    const uniqueMatches = Array.from(new Map(matches.map(m => [m.id + m.text, m])).values());
    setQuerySuggestions(uniqueMatches.slice(0, 5));
  }, [searchQuery, businesses, servicesData]);`;

content = content.replace(search, replace);

fs.writeFileSync('src/pages/Home.tsx', content);
