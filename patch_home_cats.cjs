const fs = require('fs');

let homeCode = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Replace HOME_CATEGORIES definition
homeCode = homeCode.replace(
  /const HOME_CATEGORIES = \[[\s\S]*?\];/,
  `const HOME_CATEGORIES = [
   { name: "Cabeleireiro", nameKey: "home_cat_hair", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=75&fm=webp", url: "/explore?category=Cabelo %26 Barbearia" },
   { name: "Barbearia", nameKey: "home_cat_barber", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=200&q=75&fm=webp", url: "/explore?category=Cabelo %26 Barbearia&subcategory=Barbearia" },
   { name: "Nails & Beauty", nameKey: "home_cat_nails", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=200&q=75&fm=webp", url: "/explore?category=Nails %26 Beauty" },
   { name: "Estética", nameKey: "home_cat_esthetics", image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=200&q=75&fm=webp", url: "/explore?category=Estética" },
   { name: "Wellness & Spa", nameKey: "home_cat_wellness", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=200&q=75&fm=webp", url: "/explore?category=Wellness" },
   { name: "Noivas", nameKey: "home_cat_brides", image: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=200&q=75&fm=webp", url: "/explore?category=Noivas %26 Eventos" }
];`
);

homeCode = homeCode.replace(
  /\{cat\.name\}/,
  `{t(cat.nameKey) || cat.name}`
);

fs.writeFileSync('src/pages/Home.tsx', homeCode);
