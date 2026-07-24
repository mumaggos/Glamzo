const fs = require('fs');
let content = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

content = content.replace(
  /const getCategoryDisplayName = \(name: string, t: any\) => \{\s*if \(name === "Wellness"\) return t\('explore\.wellness'\);\s*if \(name === "Ao domicílio"\) return t\('explore\.atHome'\);\s*return name;\s*\};/g,
  "const getCategoryDisplayName = (name: string, t: any) => { return t(`categories.${name}`, { defaultValue: name }); };"
);

fs.writeFileSync('src/pages/Explore.tsx', content);

