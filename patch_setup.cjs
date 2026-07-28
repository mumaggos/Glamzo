const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

// 1. Remove nif, iban, legalName states
code = code.replace(/const \[nif, setNif\] = useState\(''\);\n/, '');
code = code.replace(/const \[iban, setIban\] = useState\(''\);\n/, '');
code = code.replace(/const \[legalName, setLegalName\] = useState\(''\);\n/, '');
code = code.replace(/const \[wantsTerminal, setWantsTerminal\] = useState\(false\);\n/, '');
code = code.replace(/const \[shippingName, setShippingName\] = useState\(''\);\n/, '');
code = code.replace(/const \[shippingPhone, setShippingPhone\] = useState\(''\);\n/, '');
code = code.replace(/const \[shippingAddress, setShippingAddress\] = useState\(''\);\n/, '');
code = code.replace(/const \[shippingPostalCode, setShippingPostalCode\] = useState\(''\);\n/, '');
code = code.replace(/const \[shippingCity, setShippingCity\] = useState\(''\);\n/, '');
code = code.replace(/const \[tabletOrderId, setTabletOrderId\] = useState<string \| null>\(null\);\n/, '');

// 2. Remove triggerStripeOnboarding function
const triggerStripeOnboardingStart = code.indexOf('const triggerStripeOnboarding = async () => {');
if (triggerStripeOnboardingStart !== -1) {
    let bracketCount = 0;
    let endIdx = -1;
    for (let i = triggerStripeOnboardingStart; i < code.length; i++) {
        if (code[i] === '{') bracketCount++;
        if (code[i] === '}') {
            bracketCount--;
            if (bracketCount === 0) {
                endIdx = i + 1;
                break;
            }
        }
    }
    if (endIdx !== -1) {
        code = code.slice(0, triggerStripeOnboardingStart) + code.slice(endIdx);
    }
}

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
