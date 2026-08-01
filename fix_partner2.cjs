const fs = require('fs');

const partnerSchemaStr = `
const partnerSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Glamzo Parceiros",
  "operatingSystem": "Web",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR"
  }
};
`;

let partner = fs.readFileSync('src/pages/Partner.tsx', 'utf8');

const returnStr = `  return (
    <div id="partner-landing-view" className="min-h-screen bg-[#F8F9FC] flex flex-col justify-between font-sans selection:bg-purple-100 selection:text-purple-900 pb-0 animate-fade-in">`;

if (partner.includes(returnStr)) {
    partner = partner.replace(returnStr, partnerSchemaStr + '\n' + returnStr + '\n      <SeoHead title="Glamzo para Parceiros | Software de Gestão para Salões" description="Gira o seu salão, barbearia ou clínica de estética com o Glamzo. Sem mensalidades, sem custos escondidos. Comece a receber marcações online hoje." schema={partnerSchema} />\n');
    fs.writeFileSync('src/pages/Partner.tsx', partner);
    console.log("Added SeoHead to Partner.tsx");
}
