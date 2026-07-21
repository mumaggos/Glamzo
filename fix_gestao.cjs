const fs = require('fs');
let content = fs.readFileSync('src/components/GestaoLeads.tsx', 'utf8');

content = content.replace(/setLeads\(prev => prev/g, 'setAllLeads(prev => prev');

if (!content.includes('Trash2')) {
  content = content.replace(/import {([^}]*)Users([^}]*)} from 'lucide-react';/g, "import { $1Users, Trash2$2 } from 'lucide-react';");
}

fs.writeFileSync('src/components/GestaoLeads.tsx', content);
