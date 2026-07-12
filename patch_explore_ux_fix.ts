import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

content = content.replace(
  /const \[viewModeMobile, setViewModeMobile\] = useState<"list" \| "map">\("list"\);/,
  `const [viewModeMobile, setViewModeMobile] = useState<"list" | "map">("list");
  const [viewLayout, setViewLayout] = useState<"list" | "grid">("list");
  const [searchRadius, setSearchRadius] = useState<number | null>(null);`
);

fs.writeFileSync('src/pages/Explore.tsx', content);
