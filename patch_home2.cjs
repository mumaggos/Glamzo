const fs = require('fs');

let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  /const \[searchQuery, setSearchQuery\] = useState\(searchParams\.get\("q"\) \|\| ""\);/,
  'const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");\n  const [promocoesAtivas, setPromocoesAtivas] = useState<any[]>([]);'
);

fs.writeFileSync('src/pages/Home.tsx', code);
