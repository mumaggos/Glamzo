const fs = require('fs');
let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// The faulty string is:
// <div className="min-h-[100dvh]">
//       <SeoHead title="Glamzo | Plataforma & Agendamentos de Beleza Premium" description="Glamzo é a plataforma líder em beleza em Portugal. Agende cabeleireiro, barbeiro, manicures, estética e massagens online com rapidez e segurança." /> bg-[#FDFDFD] font-sans flex flex-col selection:bg-purple-100 selection:text-purple-950"> 
// Let's replace it with a valid structure.

home = home.replace(
    /<\div className="min-h-\[100dvh\]">[\s\S]*?bg-\[\#FDFDFD\] font-sans flex flex-col selection:bg-purple-100 selection:text-purple-950">/m,
    `<div className="min-h-[100dvh] bg-[#FDFDFD] font-sans flex flex-col selection:bg-purple-100 selection:text-purple-950">\n      <SeoHead title="Glamzo | Plataforma & Agendamentos de Beleza Premium" description="Glamzo é a plataforma líder em beleza em Portugal. Agende cabeleireiro, barbeiro, manicures, estética e massagens online com rapidez e segurança." />`
);

fs.writeFileSync('src/pages/Home.tsx', home);
console.log("Fixed Home.tsx syntax");
