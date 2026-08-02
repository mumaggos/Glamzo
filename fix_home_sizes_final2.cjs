const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  `       <Image fill 
           src={b.cover_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=60&fm=webp"} 
           alt={b.name} 
           sizes="(max-width: 640px) 280px, 280px"
           className="w-full h-full object-cover sm:group-hover:scale-105 transition-transform duration-700 ease-out"
          sizes="(max-width: 640px) 280px, 280px" 
         />`,
  `       <Image fill 
           src={b.cover_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=60&fm=webp"} 
           alt={b.name} 
           className="w-full h-full object-cover sm:group-hover:scale-105 transition-transform duration-700 ease-out"
           sizes="(max-width: 640px) 280px, 280px" 
         />`
);
fs.writeFileSync('src/pages/Home.tsx', code);
