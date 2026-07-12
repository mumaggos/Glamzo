import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// 1. Debounce and safe array checking for querySuggestions
const useEffOrig = `useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setQuerySuggestions([]);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const matches: any[] = [];
    
    // Check businesses
    businesses.forEach(b => {
      const bName = b.name || "";
      const bCat = b.category || "";
      if (bName.toLowerCase().includes(q) || bCat.toLowerCase().includes(q)) {
        matches.push({ type: 'business', id: b.id, name: b.name, slug: b.slug, text: b.name });
      }
    });
    
    // Check services
    servicesData.forEach(s => {
      const sName = s.name || "";
      if (sName.toLowerCase().includes(q)) {
        const b = businesses.find(bz => bz.id === s.business_id);
        if (b) {
          matches.push({ type: 'service', id: b.id, name: b.name, slug: b.slug, text: \`\${s.name} em \${b.name}\` });
        }
      }
    });
    
    const uniqueMatches = Array.from(new Map(matches.map(m => [m.id + m.text, m])).values());
    setQuerySuggestions(uniqueMatches.slice(0, 5));
  }, [searchQuery, businesses, servicesData]);`;

const useEffRep = `useEffect(() => {
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

content = content.replace(useEffOrig, useEffRep);

// 2. Safe mapping in JSX
const renderOrig = `{showQuerySuggestions && querySuggestions.length > 0 && (
                <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl z-30 py-2 text-left overflow-y-auto max-h-60 custom-scrollbar">
                  {querySuggestions.map((s, idx) => (
                    <button key={idx} onMouseDown={() => navigate(\`/business/\${s.slug}\`)} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-800 text-sm flex items-center gap-2 border-b border-slate-50 transition-colors last:border-0">
                      <Search className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{s.text}</span>
                    </button>
                  ))}
                </div>
              )}`;

const renderRep = `{showQuerySuggestions && Array.isArray(querySuggestions) && querySuggestions.length > 0 && (
                <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl z-30 py-2 text-left overflow-y-auto max-h-60 custom-scrollbar">
                  {querySuggestions.map((s, idx) => (
                    <button key={idx} onMouseDown={() => navigate(\`/business/\${s?.slug}\`)} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-800 text-sm flex items-center gap-2 border-b border-slate-50 transition-colors last:border-0">
                      <Search className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{s?.text || ""}</span>
                    </button>
                  ))}
                </div>
              )}`;

content = content.replace(renderOrig, renderRep);

fs.writeFileSync('src/pages/Home.tsx', content);
