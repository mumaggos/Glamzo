const fs = require('fs');

let setupWizard = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

const oldEffect = `  useEffect(() => {
    if (loading) return;
    const draft = { step, name, phone, email, address, doorNumber, city, district, postalCode, category, logoUrl, businessHours, setupByGlamzo };
    // localStorage removed
  }, [step, name, phone, email, address, doorNumber, city, district, postalCode, category, logoUrl, businessHours, setupByGlamzo, loading]);`;

const newEffect = `  useEffect(() => {
    if (loading) return;
    const draft = { step, name, phone, email, address, doorNumber, city, district, postalCode, category, logoUrl, businessHours, setupByGlamzo };
    localStorage.setItem('setupWizardDraft', JSON.stringify(draft));
  }, [step, name, phone, email, address, doorNumber, city, district, postalCode, category, logoUrl, businessHours, setupByGlamzo, loading]);`;

if(setupWizard.includes(oldEffect)) {
    setupWizard = setupWizard.replace(oldEffect, newEffect);
    console.log("Replaced draft saving effect.");
}

const oldDraftLoad = `        const draft: any = null;`;
const newDraftLoad = `        let draft: any = null;
        try {
          const stored = localStorage.getItem('setupWizardDraft');
          if (stored) draft = JSON.parse(stored);
        } catch(e) {}`;

if(setupWizard.includes(oldDraftLoad)) {
    setupWizard = setupWizard.replace(oldDraftLoad, newDraftLoad);
    console.log("Replaced draft loading.");
}

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', setupWizard);
