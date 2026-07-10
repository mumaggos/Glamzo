import fs from 'fs';

let home = fs.readFileSync('src/pages/Home.tsx', 'utf-8');
let explore = fs.readFileSync('src/pages/Explore.tsx', 'utf-8');

// Patch Home.tsx
home = home.replace(
  'const BusinessCard: React.FC<{ b: any }> = ({ b }) => (',
  'const BusinessCard: React.FC<{ b: any, priority?: boolean }> = ({ b, priority }) => ('
);

home = home.replace(
  '<img\n            src={optimizeUnsplashUrl(b.cover_url) || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=75&fm=webp"}\n            alt={b.name}\n            loading="lazy"',
  '<img\n            src={optimizeUnsplashUrl(b.cover_url) || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=75&fm=webp"}\n            alt={b.name}\n            loading={priority ? "eager" : "lazy"}\n            fetchPriority={priority ? "high" : "auto"}'
);
// In case the whitespace differs
home = home.replace(/<img\s*src=\{optimizeUnsplashUrl\(b\.cover_url\)[^>]*\s*alt=\{b\.name\}\s*loading="lazy"/, 
  '<img src={optimizeUnsplashUrl(b.cover_url) || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=75&fm=webp"} alt={b.name} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"}');

// Pass priority prop to the first 4 elements of each list in Home
home = home.replace(
  '{locaisProximos.map(b => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}',
  '{locaisProximos.map((b, i) => <div key={b.id} className="snap-start"><BusinessCard b={b} priority={i < 4} /></div>)}'
);
home = home.replace(
  '{recomendados.map(b => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}',
  '{recomendados.map((b, i) => <div key={b.id} className="snap-start"><BusinessCard b={b} priority={i < 4} /></div>)}'
);
home = home.replace(
  '{novasLojas.map(b => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}',
  '{novasLojas.map((b, i) => <div key={b.id} className="snap-start"><BusinessCard b={b} priority={i < 4} /></div>)}'
);

// Patch Explore.tsx
explore = explore.replace(
  'const BusinessCard: React.FC<{ b: any }> = ({ b }) => (',
  'const BusinessCard: React.FC<{ b: any, priority?: boolean }> = ({ b, priority }) => ('
);

explore = explore.replace(
  '<img loading="lazy"\n           src={optimizeImageUrl(b.cover_url) || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=75&fm=webp"}\n           alt={b.name}',
  '<img loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"}\n           src={optimizeImageUrl(b.cover_url) || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=75&fm=webp"}\n           alt={b.name}'
);
explore = explore.replace(/<img loading="lazy"\s*src=\{optimizeImageUrl\(b\.cover_url\)[^>]*\s*alt=\{b\.name\}/, 
  '<img loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} src={optimizeImageUrl(b.cover_url) || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=75&fm=webp"} alt={b.name}');

explore = explore.replace(
  '{paginatedBusinesses.map((b) => <BusinessCard key={b.id} b={b} />)}',
  '{paginatedBusinesses.map((b, i) => <BusinessCard key={b.id} b={b} priority={i < 4} />)}'
);

fs.writeFileSync('src/pages/Home.tsx', home);
fs.writeFileSync('src/pages/Explore.tsx', explore);
