const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace(
  /<section className="relative pt-24 pb-20/g,
  'return (\n    <div className="min-h-[100vh] bg-[#FDFDFD] font-sans flex flex-col selection:bg-purple-100 selection:text-purple-950">\n      <SeoHead title="Glamzo | Plataforma & Agendamentos de Beleza Premium" description="Glamzo é a plataforma líder em beleza em Portugal. Agende cabeleireiro, barbeiro, manicures, estética e massagens online com rapidez e segurança." schema={{}} />\n\n      <section className="relative pt-24 pb-20'
);

fs.writeFileSync('src/pages/Home.tsx', code);
