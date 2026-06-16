import fs from 'fs';
import path from 'path';

function replaceInFile(filePath: string, replacements: [RegExp, string][]) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return;
  }
  let newContent = content;
  for (const [regex, replacement] of replacements) {
    newContent = newContent.replace(regex, replacement);
  }
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${filePath}`);
  }
}

const uiReplacements: [RegExp, string][] = [
  [/a procurar no supabase/gi, "A procurar o teu lugar ideal..."],
  [/Buscando espaços reais no Supabase\.\.\./gi, "A procurar o teu lugar ideal..."],
  [/no Supabase/gi, "na plataforma"],
  [/do Supabase/gi, "da plataforma"],
  [/pagamentos pelo Stripe/gi, "pagamentos seguros"],
  [/Checkout Seguro Stripe/gi, "Checkout Seguro"],
  [/pagamentos imediatos através do Stripe/gi, "pagamentos imediatos"],
  [/via Glamzo Pay \(Stripe\)/gi, "via Glamzo Pay"],
  [/processados pela Stripe Payments Europe, Ltd\./gi, "processados de forma 100% segura."],
  [/Stripe Connect/gi, "Conta Bancária"],
  [/Stripe/gi, "Glamzo Pay"], // Broad replacement for Stripe in text (we will see if it breaks imports, we shouldn't do it blindly)
  [/fornecedor de serviço/gi, "profissional"],
  [/Fornecedor de serviço/gi, "Profissional"],
];

// Let's refine the broad replacement
const safeUiReplacements: [RegExp, string][] = [
  [/Buscando espaços reais no Supabase\.\.\./g, "A procurar o teu lugar ideal..."],
  [/a procurar no supabase/gi, "A procurar o teu lugar ideal..."],
  [/>\s*no Supabase\s*</g, "> na plataforma <"],
  [/>\s*do Supabase\s*</g, "> da plataforma <"],
  [/pagamentos pelo Stripe/gi, "pagamentos seguros"],
  [/Checkout Seguro Stripe/gi, "Checkout Seguro"],
  [/pagamentos imediatos através do Stripe/gi, "pagamentos imediatos"],
  [/via Glamzo Pay \(Stripe\)/gi, "via Glamzo Pay"],
  [/processados pela Stripe Payments Europe, Ltd\./g, "processados de forma 100% segura."],
  [/Taxa Stripe/g, "Taxa"],
  [/Stripe Connect/g, "Pagamento Seguro"],
  [/Stripe Express/g, "Pagamento Local"],
  [/Stripe Dashboard/g, "Dashboard Financeiro"],
  [/Stripe account/g, "conta de pagamentos"],
  [/powered by Stripe/gi, "pagamentos seguros"],
  [/fornecedor de serviço/gi, "profissional"],
  [/Fornecedor de serviço/gi, "Profissional"],
  [/Stripe Simulated/gi, "Checkout Simulado"], 
  [/>\s*Stripe\s*</g, "> Glamzo Pay <"],
  [/\bStripe\b/g, "Glamzo Pay"] // we have to exclude this from imports and code.
];

// So let's only do safe manual replaces.

const safeReplaces: [RegExp, string][] = [
  [/Buscando espaços reais no Supabase\.\.\./g, "A procurar o teu lugar ideal..."],
  [/a procurar no supabase/gi, "A procurar o teu lugar ideal..."],
  [/pagamentos pelo Stripe/gi, "pagamentos seguros"],
  [/Checkout Seguro Stripe/gi, "Checkout Seguro"],
  [/pagamentos imediatos através do Stripe/gi, "pagamentos imediatos"],
  [/via Glamzo Pay \(Stripe\)/gi, "via Glamzo Pay"],
  [/processados pela Stripe Payments Europe, Ltd\./g, "processados de forma 100% segura."],
  [/Taxa Stripe Connect/g, "Taxa Glamzo"],
  [/Ativar Stripe Connect/g, "Ativar Pagamentos"],
  [/Stripe Dashboard/g, "Dashboard Financeiro"],
  [/Stripe/g, "Glamzo Pay"],
  [/fornecedor de serviço/gi, "profissional"],
  [/Fornecedor de serviço/gi, "Profissional"]
];

function processContent(content: string) {
  // We'll split the file by lines, if line has an import or is an API endpoint, we don't replace Stripe/Supabase.
  let lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.includes('import ') || line.includes('stripe_') || line.includes('supabase') && line.includes('.')) {
      continue;
    }
    // we can still replace general portuguese text
    if (line.includes('Buscando espaços reais no Supabase')) {
      line = line.replace(/Buscando espaços reais no Supabase\.\.\./g, "A procurar o teu lugar ideal...");
    }
    line = line.replace(/a procurar no supabase/gi, "A procurar o teu lugar ideal...");
    line = line.replace(/pagamentos pelo Stripe/gi, "pagamentos seguros");
    line = line.replace(/Checkout Seguro Stripe/gi, "Checkout Seguro");
    line = line.replace(/pagamentos imediatos através do Stripe/gi, "pagamentos imediatos");
    line = line.replace(/via Glamzo Pay \(Stripe\)/gi, "via Glamzo Pay");
    line = line.replace(/processados pela Stripe Payments Europe, Ltd\./g, "processados de forma 100% segura.");
    line = line.replace(/Taxa Stripe Connect/g, "Taxa Glamzo");
    line = line.replace(/Ativar Stripe Connect/g, "Ativar Pagamentos");
    line = line.replace(/Taxa Stripe/g, "Taxa Glamzo");
    line = line.replace(/Stripe Dashboard/g, "Resumo de Ganhos");
    
    // carefully replace Stripe when it's just text
    line = line.replace(/>Stripe</g, ">Glamzo Pay<");
    line = line.replace(/ Stripe /g, " Glamzo Pay ");
    line = line.replace(/Stripe\./g, "Glamzo Pay.");
    line = line.replace(/Stripe,/g, "Glamzo Pay,");
    
    line = line.replace(/fornecedor de serviço/g, "profissional");
    line = line.replace(/Fornecedor de serviço/g, "Profissional");
    line = line.replace(/fornecedor de serviços/g, "profissional");
    line = line.replace(/Fornecedor de serviços/g, "Profissional");

    lines[i] = line;
  }
  return lines.join('\n');
}

const files = [
  'src/pages/Home.tsx',
  'src/pages/Explore.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/BusinessDetail.tsx',
  'src/pages/Partner.tsx',
  'src/pages/PartnerSignup.tsx',
  'src/pages/Onboarding.tsx',
  'src/components/BookingModal.tsx',
  'src/components/DashboardAssistant.tsx'
];

for (const f of files) {
  const filePath = path.join(process.cwd(), f);
  if (!fs.existsSync(filePath)) continue;
  const content = fs.readFileSync(filePath, 'utf8');
  const newContent = processContent(content);
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${f}`);
  }
}
