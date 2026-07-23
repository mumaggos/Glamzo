const fs = require('fs');

let catData = fs.readFileSync('src/utils/categoriesData.ts', 'utf8');

// Replace interface CategoryDefinition
catData = catData.replace(
  /export interface CategoryDefinition \{[\s\S]*?\}/,
  `export interface CategoryDefinition {
  id: string;
  name: string;
  nameKey: string;
  emoji: string;
  description: string;
  descKey: string;
  imageUrl: string;
}`
);

catData = catData.replace(
  /name: 'Cabelo & Barbearia',/g,
  `name: 'Cabelo & Barbearia',
    nameKey: 'cat_cabelo_name',`
);

catData = catData.replace(
  /description: 'Cortes de cabelo modernos, barbearia clássica e especializada, colorações e tratamentos profissionais.',/g,
  `description: 'Cortes de cabelo modernos, barbearia clássica e especializada, colorações e tratamentos profissionais.',
    descKey: 'cat_cabelo_desc',`
);

catData = catData.replace(
  /name: 'Nails & Beauty',/g,
  `name: 'Nails & Beauty',
    nameKey: 'cat_nails_name',`
);

catData = catData.replace(
  /description: 'Serviços especializados de manicure, pedicure, gel, design de sobrancelhas, pestanas e maquilhagem.',/g,
  `description: 'Serviços especializados de manicure, pedicure, gel, design de sobrancelhas, pestanas e maquilhagem.',
    descKey: 'cat_nails_desc',`
);

catData = catData.replace(
  /name: 'Estética',/g,
  `name: 'Estética',
    nameKey: 'cat_estetica_name',`
);

catData = catData.replace(
  /description: 'Cuidados faciais e corporais especializados, depilação tradicional e a laser, skin care e bronzeamento.',/g,
  `description: 'Cuidados faciais e corporais especializados, depilação tradicional e a laser, skin care e bronzeamento.',
    descKey: 'cat_estetica_desc',`
);

catData = catData.replace(
  /name: 'Wellness',/g,
  `name: 'Wellness',
    nameKey: 'cat_wellness_name',`
);

catData = catData.replace(
  /description: 'Terapias relaxantes de massagens, tratamentos de spa regenerativos, osteopatia, reiki e bem-estar.',/g,
  `description: 'Terapias relaxantes de massagens, tratamentos de spa regenerativos, osteopatia, reiki e bem-estar.',
    descKey: 'cat_wellness_desc',`
);

catData = catData.replace(
  /name: 'Ao domicílio',/g,
  `name: 'Ao domicílio',
    nameKey: 'cat_domicilio_name',`
);

catData = catData.replace(
  /description: 'Comodidade extrema de atendimento personalizado com especialistas que se deslocam a sua residência.',/g,
  `description: 'Comodidade extrema de atendimento personalizado com especialistas que se deslocam a sua residência.',
    descKey: 'cat_domicilio_desc',`
);

catData = catData.replace(
  /name: 'Noivas & Eventos',/g,
  `name: 'Noivas & Eventos',
    nameKey: 'cat_noivas_name',`
);

catData = catData.replace(
  /description: 'Serviços completos e rituais de beleza personalizados para casamentos, convidados e eventos formais.',/g,
  `description: 'Serviços completos e rituais de beleza personalizados para casamentos, convidados e eventos formais.',
    descKey: 'cat_noivas_desc',`
);

fs.writeFileSync('src/utils/categoriesData.ts', catData);
