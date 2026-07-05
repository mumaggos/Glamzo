import fs from 'fs';
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// 1. Add services to the returned business object
content = content.replace(
  'return { ...b, rating, reviewsCount: bReviews.length || (b.is_premium ? 24 : 0), startPrice: derivedPrice, lat, lng, distance, isOpenNow: true, isNew };',
  'return { ...b, rating, reviewsCount: bReviews.length || (b.is_premium ? 24 : 0), startPrice: derivedPrice, lat, lng, distance, isOpenNow: true, isNew, services: bServices };'
);

// 2. Fix the getFilteredResults logic
const oldCatFilter = `      res = res.filter(b => 
         b.category.toLowerCase().includes(activeCategory.toLowerCase()) || 
         (b.description && b.description.toLowerCase().includes(activeCategory.toLowerCase())) ||
        b.name.toLowerCase().includes(activeCategory.toLowerCase())
      );`;
const newCatFilter = `      res = res.filter(b => 
         (b.category && b.category.toLowerCase().includes(activeCategory.toLowerCase())) || 
         (b.description && b.description.toLowerCase().includes(activeCategory.toLowerCase())) ||
         (b.name && b.name.toLowerCase().includes(activeCategory.toLowerCase())) ||
         (b.services && b.services.some((s: any) => s.name && s.name.toLowerCase().includes(activeCategory.toLowerCase()) || (s.description && s.description.toLowerCase().includes(activeCategory.toLowerCase()))))
      );`;
content = content.replace(oldCatFilter, newCatFilter);

const oldSearchFilter = `      res = res.filter(b => 
         b.name.toLowerCase().includes(q) || 
         b.city.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) || 
         (b.description && b.description.toLowerCase().includes(q))
      );`;
const newSearchFilter = `      res = res.filter(b => 
         (b.name && b.name.toLowerCase().includes(q)) || 
         (b.city && b.city.toLowerCase().includes(q)) ||
         (b.category && b.category.toLowerCase().includes(q)) || 
         (b.description && b.description.toLowerCase().includes(q)) ||
         (b.services && b.services.some((s: any) => s.name && s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q))))
      );`;
content = content.replace(oldSearchFilter, newSearchFilter);

fs.writeFileSync('src/pages/Home.tsx', content);

