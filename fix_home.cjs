const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Replace outer BusinessCard Image
code = code.replace(
`       <Image fill 
           src={b.cover_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=60&fm=webp"} 
           alt={b.name} 
           className="w-full h-full object-cover sm:group-hover:scale-105 transition-transform duration-700 ease-out" 
         />`,
`       <Image fill 
           src={b.cover_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=60&fm=webp"} 
           alt={b.name} 
           sizes="(max-width: 640px) 280px, 280px"
           className="w-full h-full object-cover sm:group-hover:scale-105 transition-transform duration-700 ease-out" 
         />`
);

// Remove inner BusinessCard
const startInner = code.indexOf(`  // Cartão Minimalista de Elite (Estilo Airbnb)\n  const BusinessCard: React.FC<{ b: any }> = ({ b }) => (`);
const endInner = code.indexOf(`  return (\n    <div className="min-h-screen`);

if (startInner !== -1 && endInner !== -1) {
  code = code.substring(0, startInner) + code.substring(endInner);
}

fs.writeFileSync('src/pages/Home.tsx', code);
