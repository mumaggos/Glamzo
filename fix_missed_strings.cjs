const fs = require('fs');

const wizardContent = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

let newWizardContent = wizardContent
  .replace("'Avançar para Pagamento'", "t('setupWizard.proceedToPayment')")
  .replace("'Iniciar 14 Dias Grátis'", "t('setupWizard.start14DaysFree')")
  .replace("'Assinar Plano'", "t('setupWizard.signPlan')")
  .replace("'Prosseguir'", "t('setupWizard.proceedBtn')");

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', newWizardContent);

// Add to i18n
let i18n = fs.readFileSync('src/i18n.ts', 'utf8');
const langs = ['en', 'pt', 'es', 'fr'];

const additions = {
  proceedToPayment: "Avançar para Pagamento",
  start14DaysFree: "Iniciar 14 Dias Grátis",
  signPlan: "Assinar Plano"
};

for (const lang of langs) {
  const regex = new RegExp(`(${lang}:\\s*{\\s*translation:\\s*{\\s*setupWizard:\\s*{)`);
  i18n = i18n.replace(regex, `$1\n            proceedToPayment: "Avançar para Pagamento",\n            start14DaysFree: "Iniciar 14 Dias Grátis",\n            signPlan: "Assinar Plano",`);
}

fs.writeFileSync('src/i18n.ts', i18n);

