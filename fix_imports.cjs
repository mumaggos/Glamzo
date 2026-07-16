const fs = require('fs');
let lines = fs.readFileSync('src/components/StoreManagementTab.tsx', 'utf8').split('\n');

lines[1] = "import { Store, Terminal, CheckCircle2, ShieldAlert, CreditCard, ChevronDown, Package, Edit, Calendar, QrCode, Trash2, Building2, Search, Settings, Monitor, Copy, LogOut } from 'lucide-react';";
lines[4] = ""; // remove the old one

fs.writeFileSync('src/components/StoreManagementTab.tsx', lines.join('\n'));
console.log('Fixed imports');
