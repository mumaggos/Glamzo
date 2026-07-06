const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

if (!code.includes("Clock")) {
    // shouldn't happen, we know it has <Clock />
}
code = code.replace(
    /import \{\s*Building2,\s*Scissors,\s*CreditCard,\s*Landmark,\s*CheckCircle,\s*ArrowRight,\s*ArrowLeft,\s*Loader2,\s*Sparkles,\s*Check,\s*MapPin,\s*Camera,\s*Upload\s*\} from 'lucide-react';/,
    `import { Building2, Scissors, CreditCard, Landmark, CheckCircle, ArrowRight, ArrowLeft, Loader2, Sparkles, Check, MapPin, Camera, Upload, Clock } from 'lucide-react';`
);
fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
