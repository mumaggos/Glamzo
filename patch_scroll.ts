import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const newScrollFunc = `  const scrollCategories = (direction: 'left' | 'right') => {
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        // Read clientWidth efficiently inside rAF to avoid layout thrashing
        const containerWidth = scrollContainerRef.current.clientWidth || 300;
        const scrollAmount = Math.max(300, containerWidth * 0.8);
        const targetScroll = direction === 'right' ? scrollAmount : -scrollAmount;
        scrollContainerRef.current.scrollBy({ left: targetScroll, behavior: 'smooth' });
      }
    });
  };`;

content = content.replace(
  /const scrollCategories = \(direction: 'left' \| 'right'\) => \{[\s\S]*?\};\s*$/,
  newScrollFunc
);

// We need a safer regex replace
content = content.replace(
`  const scrollCategories = (direction: 'left' | 'right') => { 
    if (scrollContainerRef.current) { 
      const scrollAmount = 300; 
      if (direction === 'right') scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' }); 
      else scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' }); 
    } 
  };`,
newScrollFunc
);

fs.writeFileSync('src/pages/Home.tsx', content);
