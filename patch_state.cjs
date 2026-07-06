const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

if (!code.includes("const [businessHours, setBusinessHours] = useState")) {
  code = code.replace(
    /const \[logoUrl, setLogoUrl\] = useState\(''\);/,
    `const [logoUrl, setLogoUrl] = useState('');
  const DEFAULT_HOURS = [
    { weekday: 1, open_time: '09:00', close_time: '19:00', is_closed: false },
    { weekday: 2, open_time: '09:00', close_time: '19:00', is_closed: false },
    { weekday: 3, open_time: '09:00', close_time: '19:00', is_closed: false },
    { weekday: 4, open_time: '09:00', close_time: '19:00', is_closed: false },
    { weekday: 5, open_time: '09:00', close_time: '19:00', is_closed: false },
    { weekday: 6, open_time: '09:00', close_time: '13:00', is_closed: false },
    { weekday: 0, open_time: '09:00', close_time: '19:00', is_closed: true }
  ];
  const [businessHours, setBusinessHours] = useState(DEFAULT_HOURS);
  
  const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  
  const handleHourChange = (weekday: number, field: string, value: any) => {
    setBusinessHours(prev => prev.map(h => h.weekday === weekday ? { ...h, [field]: value } : h));
  };`
  );
}

// Add Clock import
if (!code.includes("Clock } from 'lucide-react'")) {
    code = code.replace(
        /Upload\} from 'lucide-react';/,
        `Upload, Clock } from 'lucide-react';`
    );
}

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
