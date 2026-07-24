const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Replace "Perto de Mim" with t('home.nearMe')
content = content.replace(/setSearchLocation\("Perto de Mim"\)/g, "setSearchLocation(t('home.nearMe'))");
content = content.replace(/searchLocation === "Perto de Mim"/g, "searchLocation === t('home.nearMe')");

// Replace {cat.name} with {t(`categories.${cat.name}`, { defaultValue: cat.name })}
content = content.replace(
  /<span className="absolute bottom-3 left-3 right-3 text-left text-sm font-bold text-white leading-tight drop-shadow-md font-\['Outfit'\]">\s*\{cat\.name\}\s*<\/span>/,
  "<span className=\"absolute bottom-3 left-3 right-3 text-left text-sm font-bold text-white leading-tight drop-shadow-md font-['Outfit']\">\n                  {t(`categories.${cat.name}`, { defaultValue: cat.name })}\n                </span>"
);

// Replace {b.category} with {t(`categories.${b.category}`, { defaultValue: b.category })}
content = content.replace(
  /<p className="text-sm text-slate-500 mt-0\.5 truncate">\{b\.category\} · \{b\.city\}<\/p>/g,
  "<p className=\"text-sm text-slate-500 mt-0.5 truncate\">{t(`categories.${b.category}`, { defaultValue: b.category })} · {b.city}</p>"
);

fs.writeFileSync('src/pages/Home.tsx', content);

