import fs from 'fs';

let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

// Ensure import exists
if (!content.includes('optimizeSupabaseUrl')) {
  content = content.replace(
    'import { Business, Service, Review, WorkingHours, StoreAsset } from "../types";',
    'import { Business, Service, Review, WorkingHours, StoreAsset } from "../types";\nimport { optimizeSupabaseUrl } from "../utils/imageOptimizer";'
  );
}

// Ensure fetchPriority="high" instead of fetchpriority="high" or loading="lazy" for cover_url
content = content.replace(/<img[^>]*src=\{business\.cover_url[^>]*>/, (match) => {
  let newImg = match.replace(/loading="lazy"/g, '');
  if (!newImg.includes('fetchPriority="high"')) {
    newImg = newImg.replace('<img', '<img fetchPriority="high"');
  }
  newImg = newImg.replace('src={business.cover_url ||', 'src={optimizeSupabaseUrl(business.cover_url || "", 1200) ||');
  return newImg;
});

// Update the logo_url as well
content = content.replace(/<img[^>]*src=\{business\.logo_url[^>]*>/, (match) => {
  let newImg = match.replace(/loading="lazy"/g, '');
  if (!newImg.includes('fetchPriority="high"')) {
    newImg = newImg.replace('<img', '<img fetchPriority="high"');
  }
  newImg = newImg.replace('src={business.logo_url ||', 'src={optimizeSupabaseUrl(business.logo_url || "", 300) ||');
  return newImg;
});

// Look for unsplash image replacement too if any, though the user specifically mentioned supabase URL
// Unsplash images can be optimized by adding format=webp to query
content = content.replace(
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80&fm=webp'
);

content = content.replace(
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=150&q=70',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=150&q=70&fm=webp'
);

fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
