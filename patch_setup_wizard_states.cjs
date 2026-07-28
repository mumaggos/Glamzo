const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

code = code.replace(
  "const [services, setServices] = useState<any[]>([]);",
  `const [services, setServices] = useState<any[]>([]);
  // Step 4: Billing & KYC
  const [legalName, setLegalName] = useState('');
  const [nif, setNif] = useState('');
  const [iban, setIban] = useState('');`
);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
