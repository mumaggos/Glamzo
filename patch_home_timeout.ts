import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

content = content.replace(
  '    const fetchTimer = setTimeout(() => {\n      fetchData(); \n    }, 150);\n    return () => clearTimeout(fetchTimer);',
  '    fetchData();'
);

content = content.replace(
  '    const fetchTimer = setTimeout(() => {\n      fetchData();\n    }, 150);\n    return () => clearTimeout(fetchTimer);',
  '    fetchData();'
);

// Look for other instances
content = content.replace(/const fetchTimer = setTimeout\(\(\) => \{\s*fetchData\(\);\s*\}, 150\);\s*return \(\) => clearTimeout\(fetchTimer\);/g, 'fetchData();');

fs.writeFileSync('src/pages/Home.tsx', content);
