const fs = require('fs');
let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');

home = home.replace(
    '<div className="min-h-[100dvh]">\n      <SeoHead title="Glamzo | Plataforma & Agendamentos de Beleza Premium" description="Glamzo é a plataforma líder em beleza em Portugal. Agende cabeleireiro, barbeiro, manicures, estética e massagens online com rapidez e segurança." /> bg-[#FDFDFD] font-sans flex flex-col selection:bg-purple-100 selection:text-purple-950">',
    '<div className="min-h-[100dvh] bg-[#FDFDFD] font-sans flex flex-col selection:bg-purple-100 selection:text-purple-950">\n      <SeoHead title="Glamzo | Plataforma & Agendamentos de Beleza Premium" description="Glamzo é a plataforma líder em beleza em Portugal. Agende cabeleireiro, barbeiro, manicures, estética e massagens online com rapidez e segurança." />'
);

fs.writeFileSync('src/pages/Home.tsx', home);
console.log("Fixed Home.tsx syntax");
