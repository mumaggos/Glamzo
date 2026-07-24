const fs = require('fs');
let i18n = fs.readFileSync('src/i18n.ts', 'utf8');

const missing = {
  en: '"Cabelo & Barbearia": "Hair & Barbershop"',
  pt: '"Cabelo & Barbearia": "Cabelo & Barbearia"',
  es: '"Cabelo & Barbearia": "Cabello & Barbería"',
  fr: '"Cabelo & Barbearia": "Coiffure & Barbier"'
};

// Assuming they were missed or partially implemented, let's verify if they are there.
