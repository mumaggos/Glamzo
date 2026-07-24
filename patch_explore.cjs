const fs = require('fs');
let content = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

content = content.replace(/setLocalSearchLocation\("Perto de Mim"\)/g, "setLocalSearchLocation(t('home.nearMe'))");
content = content.replace(
  /<p className="text-xs font-medium text-purple-600 truncate">\{b\.category\}<\/p>/g,
  "<p className=\"text-xs font-medium text-purple-600 truncate\">{t(`categories.${b.category}`, { defaultValue: b.category })}</p>"
);

// Are there other places? Let's check categoriesData.ts maybe, but we can do it later if needed.
fs.writeFileSync('src/pages/Explore.tsx', content);

