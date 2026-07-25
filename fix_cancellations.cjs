const fs = require('fs');

let content = fs.readFileSync('src/i18n.ts', 'utf8');

const langs = ['en', 'es', 'fr'];
const replacements = {
  en: {
    a4_1: "Both parties are protected. If the professional cancels out of nowhere when you arrived at the store, or if you had an emergency (e.g. Health) and the partner refuses a refund upon proof, Glamzo intervenes:",
    a4_li1: "Contact us through the Help Center with proof.",
    a4_li2: "The Team will attempt to reverse frozen refunds on Stripe upon valid proof under exceptional circumstances, without a guaranteed promise of return if the proof dictates on the side of the Partner's Terms contract."
  },
  es: {
    a4_1: "Ambas partes están protegidas. Si el profesional cancela de la nada cuando llegó a la tienda, o si tuvo una emergencia (ej. Salud) y el socio rechaza el reembolso ante la prueba, Glamzo interviene:",
    a4_li1: "Contáctenos a través del Centro de Ayuda con pruebas.",
    a4_li2: "El Equipo intentará revertir reembolsos congelados en Stripe mediante prueba válida en circunstancias excepcionales, sin promesa garantizada de devolución si la prueba falla a favor del contrato de Términos del Socio."
  },
  fr: {
    a4_1: "Les deux parties sont protégées. Si le professionnel annule sans prévenir lorsque vous êtes arrivé au salon, ou si vous avez eu une urgence (ex. Santé) et que le partenaire refuse un remboursement sur preuve, Glamzo intervient :",
    a4_li1: "Contactez-nous via le Centre d'Aide avec des preuves.",
    a4_li2: "L'Équipe tentera d'annuler les remboursements bloqués sur Stripe sur preuve valide dans des circonstances exceptionnelles, sans promesse garantie de retour si la preuve indique le contraire selon les Termes du Partenaire."
  }
};

for (const lang of langs) {
  const langKey = `"${lang}": {`;
  const startIdx = content.indexOf(langKey);
  const legalIdx = content.indexOf('"legal": {', startIdx);
  const cancellationsIdx = content.indexOf('"cancellations": {', legalIdx);
  
  // Find "a4": "..." in cancellations block and replace with the three keys
  const a4Start = content.indexOf('"a4": "', cancellationsIdx);
  if (a4Start > -1 && a4Start < content.indexOf('"cookies":', cancellationsIdx)) {
    const a4End = content.indexOf('"', a4Start + '"a4": "'.length) + 1;
    
    const rep = `\"a4_1\": \"${replacements[lang].a4_1}\",\n          \"a4_li1\": \"${replacements[lang].a4_li1}\",\n          \"a4_li2\": \"${replacements[lang].a4_li2}\"`;
    
    content = content.substring(0, a4Start) + rep + content.substring(a4End);
  }
}

fs.writeFileSync('src/i18n.ts', content);
console.log('Fixed cancellations a4 structure.');
