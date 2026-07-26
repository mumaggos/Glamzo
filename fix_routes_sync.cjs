const fs = require('fs');

// 1. Home.tsx
let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');
home = home.replace(/to={`\/business\/\${b\.slug}`}/g, 'to={`/${b.slug}`}');
home = home.replace(/navigate\(\`\/business\/\${s\?\.slug}\`\)/g, 'navigate(`/${s?.slug}`)');
home = home.replace(/navigate\("\/business\/" \+ b\.slug\)/g, 'navigate("/" + b.slug)');
fs.writeFileSync('src/pages/Home.tsx', home);

// 2. Explore.tsx
let explore = fs.readFileSync('src/pages/Explore.tsx', 'utf8');
explore = explore.replace(/to={`\/business\/\${b\.slug}`}/g, 'to={`/${b.slug}`}');
explore = explore.replace(/navigate\(\`\/business\/\${b\.slug}\?date=\${slotDate}&time=\${slotTime}\`\)/g, 'navigate(`/${b.slug}?date=${slotDate}&time=${slotTime}`)');
fs.writeFileSync('src/pages/Explore.tsx', explore);

// 3. Favorites.tsx
let favorites = fs.readFileSync('src/pages/Favorites.tsx', 'utf8');
favorites = favorites.replace(/navigate\(\`\/business\/\${biz\.slug}\`\)/g, 'navigate(`/${biz.slug}`)');
fs.writeFileSync('src/pages/Favorites.tsx', favorites);

// 4. GlamzoMessenger.tsx
let messenger = fs.readFileSync('src/components/GlamzoMessenger.tsx', 'utf8');
// They have some complex checking in GlamzoMessenger
// if (location.pathname.startsWith('/business/')) slug = location.pathname.split('/business/')[1];
// This logic is fine, it just checks for '/business/' as a fallback. Let's make sure it also catches `/:slug`.
// It actually already has:
// const isBusinessPage = location.pathname.startsWith('/business/') || location.pathname.startsWith('/store/') || (location.pathname.split('/').length === 2 && location.pathname !== '/explore' && location.pathname !== '/favorites' && location.pathname !== '/login' && location.pathname !== '/signup');
// This is already robust. 

fs.writeFileSync('src/components/GlamzoMessenger.tsx', messenger);

console.log("Replaced /business/:slug with /:slug in navigations");
