const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

const target1 = `  const [setupByGlamzo, setSetupByGlamzo] = useState(false);`;
code = code.replace(target1, '');

const target2 = `  const [services, setServices] = useState<any[]>([]);`;
const replace2 = `  const [services, setServices] = useState<any[]>([]);
  const [setupByGlamzo, setSetupByGlamzo] = useState(false);`;
// Wait, I should move it to before line 129
const target3 = `  const DEFAULT_HOURS = [`;
const replace3 = `  const [setupByGlamzo, setSetupByGlamzo] = useState(false);
  const DEFAULT_HOURS = [`;
code = code.replace(target3, replace3);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
console.log('SetupWizard step 5 patched.');
