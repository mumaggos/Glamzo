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

if (!partner.includes('<SeoHead')) {
    const returnRegex = /  return \(\n    <div className="min-h-screen bg-slate-50">/m;
    const match = partner.match(returnRegex);
    if (match) {
        partner = partner.replace(match[0], partnerSchemaStr + '\n  return (\n    <div className="min-h-screen bg-slate-50">\n      <SeoHead title="Glamzo para Parceiros | Software de Gestão para Salões" description="Gira o seu salão, barbearia ou clínica de estética com o Glamzo. Sem mensalidades, sem custos escondidos. Comece a receber marcações online hoje." schema={partnerSchema} />');
        fs.writeFileSync('src/pages/Partner.tsx', partner);
        console.log("Added SeoHead to Partner.tsx");
    } else {
        console.log("Could not match return in Partner.tsx");
    }
}
