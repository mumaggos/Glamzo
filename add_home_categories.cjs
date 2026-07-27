const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const homeCategoriesStr = `
// Categorias Fotográficas Premium (Estilo Treatwell) 
const HOME_CATEGORIES = [ 
  { name: "Cabeleireiro", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=75&fm=webp", url: "/explore?category=Cabelo %26 Barbearia" }, 
  { name: "Barbearia", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=200&q=75&fm=webp", url: "/explore?category=Cabelo %26 Barbearia&subcategory=Barbearia" }, 
  { name: "Nails & Beauty", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=200&q=75&fm=webp", url: "/explore?category=Nails %26 Beauty" }, 
  { name: "Estética", image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=200&q=75&fm=webp", url: "/explore?category=Estética" }, 
  { name: "Wellness & Spa", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=200&q=75&fm=webp", url: "/explore?category=Wellness" }, 
  { name: "Noivas", image: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=200&q=75&fm=webp", url: "/explore?category=Noivas %26 Eventos" } 
];

`;

content = content.replace('const SUGGESTED_CITIES =', homeCategoriesStr + 'const SUGGESTED_CITIES =');
fs.writeFileSync('src/pages/Home.tsx', content);
