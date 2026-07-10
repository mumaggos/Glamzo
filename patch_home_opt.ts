import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const newOptimizer = `const optimizeUnsplashUrl = (url: string) => { 
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
  /const optimizeUnsplashUrl = \(url: string\) => \{[\s\S]*?return url;\s*\};/,
  newOptimizer
);

fs.writeFileSync('src/pages/Home.tsx', content);
