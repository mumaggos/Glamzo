import fs from 'fs';
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

const oldCats = `const SMALL_CATEGORIES = [
  { name: "Barbearias", icon: "💈" },
  { name: "Cabeleireiros", icon: "💇" },
  { name: "Unhas", icon: "💅" },
  { name: "Spa", icon: "💆" },
  { name: "Maquilhagem", icon: "💄" },
  { name: "Pestanas", icon: "👁" },
  { name: "Estética", icon: "🧖" },
  { name: "Medicina Estética", icon: "💉" },
  { name: "Depilação", icon: "🪒" },
  { name: "Massagens", icon: "💆" },
  { name: "Bem-estar", icon: "🏋️" },
  { name: "Fisioterapia", icon: "🩺" },
  { name: "Tatuagens", icon: "🎨" },
  { name: "Piercing", icon: "💎" },
];`;

const newCats = `const SMALL_CATEGORIES = [
  { name: "Barbeiro", icon: "💈" },
  { name: "Cabeleireiro", icon: "💇" },
  { name: "Unhas", icon: "💅" },
  { name: "Sobrancelhas", icon: "👁️" },
  { name: "Pestanas", icon: "👁" },
  { name: "Estética", icon: "🧖" },
  { name: "Medicina Estética", icon: "💉" },
  { name: "Massagens", icon: "💆" },
  { name: "Depilação", icon: "🪒" },
  { name: "Spa", icon: "💆" },
  { name: "Maquilhagem", icon: "💄" },
  { name: "Podologia", icon: "🦶" },
  { name: "Nutrição", icon: "🥗" },
  { name: "Bem-estar", icon: "🧘" },
  { name: "Fisioterapia", icon: "🩺" },
  { name: "Tatuagens", icon: "🎨" },
  { name: "Piercing", icon: "💎" },
];`;

content = content.replace(oldCats, newCats);
fs.writeFileSync('src/pages/Home.tsx', content);

