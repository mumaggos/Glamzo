const fs = require('fs');

// Fix types
let typeCode = fs.readFileSync('src/types/index.ts', 'utf8');
typeCode = typeCode.replace(/door_number\?: string \| null;\n/g, '');
typeCode = typeCode.replace(/address: string;/, 'address: string;\n  door_number?: string | null;');
fs.writeFileSync('src/types/index.ts', typeCode);

// Fix SetupWizard
let swCode = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');
swCode = swCode.replace(/Upload, Clock \} from 'lucide-react'/, "Upload } from 'lucide-react'");
swCode = swCode.replace(/Upload\} from 'lucide-react'/, "Upload, Clock } from 'lucide-react'");
fs.writeFileSync('src/pages/partner/SetupWizard.tsx', swCode);

