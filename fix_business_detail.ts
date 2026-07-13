import * as fs from 'fs';
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');

if (!content.includes('const [isStoreOnline, setIsStoreOnline]')) {
  content = content.replace(
    /const \[business, setBusiness\] = useState<Business \| null>\(null\);/,
    "const [business, setBusiness] = useState<Business | null>(null);\n  const [isStoreOnline, setIsStoreOnline] = useState(false);"
  );
  fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
  console.log("Fixed isStoreOnline in BusinessDetail");
} else {
  console.log("Already fixed");
}
