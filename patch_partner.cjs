const fs = require('fs');
let partner = fs.readFileSync('src/pages/Partner.tsx', 'utf8');

if (!partner.includes('useTranslation')) {
  partner = partner.replace("import { Link,", "import { useTranslation } from 'react-i18next';\nimport { Link,");
  partner = partner.replace("export default function Partner() {", "export default function Partner() {\n  const { t } = useTranslation();");
}

const stringsToReplace = [
  ["O Software de Gestão e Marketplace para a Indústria da Beleza", "heroTitle"],
  ["Aumente a sua faturação, proteja a sua agenda contra faltas de comparência e atraia novos clientes. Sem mensalidades, sem comissões ocultas.", "heroSubtitle"],
  ["Tudo o que precisa para crescer.", "featuresTitle"],
  ["Gestão de Agenda", "feat1Title"],
  ["Controlo total sobre marcações, bloqueio de horários e gestão de equipas num só lugar.", "feat1Desc"],
  ["Marketplace Exclusivo", "feat2Title"],
  ["Seja descoberto por milhares de clientes na sua zona. Página web otimizada para o Google.", "feat2Desc"],
  ["Proteção Anti-Faltas", "feat3Title"],
  ["Cobranças de sinais automáticas e políticas de cancelamento que protegem o seu tempo.", "feat3Desc"],
  ["Análise Financeira & Performance", "feat4Title"],
  ["Saiba exatamente quanto faturou por dia, qual o seu lucro líquido e qual o profissional que gera mais receita. Exporte faturas num clique.", "feat4Desc"],
  ["Invista no crescimento.", "pricingTitle"],
  ["Sem taxas surpresa. Cancele quando quiser. Escolha o plano perfeito.", "pricingSubtitle"],
  ["100% Digital", "planProDigital"],
  ["O ecossistema essencial para lotar a sua agenda e gerir o seu espaço.", "planProDesc"],
  ["Agenda", "planProFeat1"],
  ["Página Web SEO", "planProFeat2"],
  ["Pagamentos Online e Tap-to-Pay no Telemóvel", "planProFeat3"],
  ["Zero taxas por funcionário (Staff Ilimitado)", "planProFeat4"],
  ["Teste 14 Dias Grátis", "planProBtn"],
  ["(Taxa transparente de processamento: 2% + 0.75€ por transação paga via cartão. Zero comissões de marketplace).", "planProDisclaimer"],
  ["Opcional - Equipamento", "planTermBadge"],
  ["Terminal Físico Glamzo", "planTermTitle"],
  ["Portes e Impostos Incluídos", "planTermShipping"],
  ["Esqueça os alugueres mensais. Compre a sua máquina e ela é sua para sempre.", "planTermDesc"],
  ["Zero Mensalidades ou Fidelização", "planTermFeat1"],
  ["Pagamentos Contactless e Chip", "planTermFeat2"],
  ["Sincronização direta com a Agenda", "planTermFeat3"],
  ["Adicionar Terminal (Opcional)", "planTermBtn"],
  ["Perguntas Frequentes", "faqTitle"],
  ["Pronto para transformar o seu espaço?", "ctaTitle"],
  ["Registar Agora", "ctaRegister"],
  ["Já tenho conta", "ctaLogin"]
];

for (const [str, key] of stringsToReplace) {
  partner = partner.split(str).join(`{t('partnerPage.${key}')}`);
}

partner = partner.replace("const faqs = [", "const faqs = (t('partnerPage.faqs', { returnObjects: true }) as Array<{q: string, a: string}>) || [");

fs.writeFileSync('src/pages/Partner.tsx', partner);
console.log("Partner patched!");
