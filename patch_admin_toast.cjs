const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

code = code.replace("import { Gift } from 'lucide-react';", "import { Gift } from 'lucide-react';\nimport toast from 'react-hot-toast';");

fs.writeFileSync('src/pages/Admin.tsx', code);
