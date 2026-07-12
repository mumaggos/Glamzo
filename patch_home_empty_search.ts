import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const search = `  const handleSearchSubmit = () => { 
    const params = new URLSearchParams(); 
    if (searchQuery.trim()) params.set("q", searchQuery.trim()); 
    if (searchLocation.trim()) { 
      if (searchLocation === "Perto de Mim") params.set("nearMe", "true"); 
      else params.set("city", searchLocation.trim()); 
    } 
    navigate(\`/explore?\${params.toString()}\`); 
  };`;

const replace = `  const handleSearchSubmit = () => { 
    const params = new URLSearchParams(); 
    
    // Validate empty input to just show all results
    if (searchQuery.trim() === "" && searchLocation.trim() === "") {
      navigate('/explore');
      return;
    }
    
    if (searchQuery.trim()) params.set("q", searchQuery.trim()); 
    if (searchLocation.trim()) { 
      if (searchLocation === "Perto de Mim") params.set("nearMe", "true"); 
      else params.set("city", searchLocation.trim()); 
    } 
    navigate(\`/explore?\${params.toString()}\`); 
  };`;

content = content.replace(search, replace);

fs.writeFileSync('src/pages/Home.tsx', content);
