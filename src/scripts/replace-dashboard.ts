import fs from 'fs';
import path from 'path';

let content = fs.readFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), 'utf8');

const reps: [RegExp, string][] = [
  [/Ativar Plano PRO \(Stripe Checkout\)/g, "Ativar Plano PRO"],
  [/Continuar para Stripe/g, "Continuar para pagamento"],
  [/Fim do período\/Renovação Stripe:/g, "Fim do período/Renovação:"],
  [/Gerir faturas no portal Stripe/g, "Gerir faturas no portal de pagamentos"],
  [/Definições de Recebimentos \(Stripe Connect\)/g, "Definições de Recebimentos"],
  [/CONTA STRIPE EXPRESS ATIVA/g, "CONTA DE PAGAMENTOS ATIVA"],
  [/CONEXÃO STRIPE INCOMPLETA/g, "CONEXÃO BANCÁRIA INCOMPLETA"],
  [/Completar Cadastro no Stripe/g, "Completar Cadastro"],
  [/CONTA STRIPE EXPRESS REQUERIDA/g, "CONTA BANCÁRIA REQUERIDA"],
  [/Faturado por Stripe/g, "Faturado digitalmente"],
  [/Stripe Dashboard/g, "Dashboard de Recebimentos"],
  [/no Stripe para ativar cobranças e transferências\./g, "para ativar cobranças e transferências."],
  [/o <span className="text-slate-900">Stripe emite/g, "a <span className=\"text-slate-900\">plataforma emite"],
  [/conta bancária Glamzo Pay Connect/g, "conta bancária conectada"],
  [/Erro Stripe/g, "Erro"],
  [/Não foi possível iniciar o checkout Stripe:/g, "Não foi possível iniciar o checkout:"],
  [/Erro técnico ao ligar ao Stripe:/g, "Erro técnico ao processar pagamento:"]
];

for (const [r, s] of reps) {
  content = content.replace(r, s);
}

fs.writeFileSync(path.join(process.cwd(), 'src/pages/Dashboard.tsx'), content);
console.log('Done replacing in Dashboard');

let partnerContent = fs.readFileSync(path.join(process.cwd(), 'src/pages/Partner.tsx'), 'utf8');
partnerContent = partnerContent.replace(/Checkout Stripe/g, "Checkout Exclusivo");
partnerContent = partnerContent.replace(/Taxas base Stripe/g, "Taxas");
partnerContent = partnerContent.replace(/Até os recebimentos via Stripe/g, "Até os recebimentos via plataforma");
partnerContent = partnerContent.replace(/Gestão Stripe Connect integrada/g, "Gestão de pagamentos integrada");
fs.writeFileSync(path.join(process.cwd(), 'src/pages/Partner.tsx'), partnerContent);

// Fix Home.tsx for any Stripe
let homeContent = fs.readFileSync(path.join(process.cwd(), 'src/pages/Home.tsx'), 'utf8');
homeContent = homeContent.replace(/via Glamzo Pay \(Stripe\)/g, "via Glamzo Pay");
homeContent = homeContent.replace(/Checkout Seguro Stripe/g, "Checkout Seguro");
homeContent = homeContent.replace(/pagamentos imediatos através do Stripe/g, "pagamentos imediatos");
fs.writeFileSync(path.join(process.cwd(), 'src/pages/Home.tsx'), homeContent);

