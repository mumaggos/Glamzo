import fs from 'fs';
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const optFn = `
const optimizeUnsplashUrl = (url: string | null) => {
  if (!url) return null;
  if (url.includes('unsplash.com')) {
    if (!url.includes('w=')) return \`\${url}?auto=format&fit=crop&w=400&q=75\`;
    return url;
  }
  return url;
};

export default function Home() {`;

content = content.replace(/export default function Home\(\) \{/, optFn);

fs.writeFileSync('src/pages/Home.tsx', content);

