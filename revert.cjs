const fs = require('fs');

let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const regex = /const homeSchema = \{[\s\S]*?\};\s*return \(\s*<div className="min-h-\[100vh\] bg-\[#FDFDFD\] font-sans flex flex-col selection:bg-purple-100 selection:text-purple-950">/m;
const match = home.match(regex);
if (match) {
    home = home.replace(match[0], 'return (\n    <div className="min-h-[100vh] bg-[#FDFDFD] font-sans flex flex-col selection:bg-purple-100 selection:text-purple-950">');
}

const seoRegex = /<SeoHead\s*title="Glamzo \| Plataforma & Agendamentos de Beleza Premium"\s*description="Glamzo é a plataforma de beleza número 1 em Portugal. Encontre e reserve online os melhores salões de cabeleireiro, barbeiros, estética e manicures perto de si. Agendamento rápido e fácil."\s*schema=\{homeSchema\}\s*\/>/m;

home = home.replace(seoRegex, '<SeoHead title="Glamzo | Plataforma & Agendamentos de Beleza Premium" description="Glamzo é a plataforma líder em beleza em Portugal. Agende cabeleireiro, barbeiro, manicures, estética e massagens online com rapidez e segurança." />');

fs.writeFileSync('src/pages/Home.tsx', home);
console.log("Reverted Home.tsx");
