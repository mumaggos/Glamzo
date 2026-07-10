import fs from 'fs';

let content = fs.readFileSync('src/pages/Explore.tsx', 'utf-8');

const optimizeFunc = `const optimizeImageUrl = (url: string) => { 
  if (!url) return ""; 
  if (url.includes("images.unsplash.com")) { 
    let optimized = url; 
    optimized = optimized.replace(/w=\\d+/, "w=400"); 
    optimized = optimized.replace(/q=\\d+/, "q=75"); 
    if (!optimized.includes("fm=webp")) optimized += "&fm=webp"; 
    return optimized; 
  }
  if (url.includes("supabase.co/storage/v1/object/public/")) {
    try {
      return url.replace('/object/public/', '/render/image/public/') + "?width=400&quality=75&format=webp";
    } catch (e) {
      return url;
    }
  }
  return url; 
};`;

content = content.replace(
  '  const BusinessCard: React.FC<{ b: any }> = ({ b }) => (',
  optimizeFunc + '\n\n  const BusinessCard: React.FC<{ b: any }> = ({ b }) => ('
);

content = content.replace(
  'src={b.cover_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600"}',
  'src={optimizeImageUrl(b.cover_url) || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=75&fm=webp"}'
);

fs.writeFileSync('src/pages/Explore.tsx', content);
