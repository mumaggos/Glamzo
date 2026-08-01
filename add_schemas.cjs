const fs = require('fs');

// Home.tsx
const homeSchemaStr = `
const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "url": "https://glamzo.pt/",
      "name": "Glamzo",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://glamzo.pt/explore?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "name": "Glamzo",
      "url": "https://glamzo.pt",
      "logo": "https://glamzo.pt/favicon-v2.svg",
      "sameAs": [
        "https://www.instagram.com/glamzo.pt",
        "https://www.facebook.com/glamzo.pt"
      ]
    }
  ]
};
`;

let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');
const homeReturn = `  return (
    <div className="min-h-[100vh] bg-[#FDFDFD] font-sans flex flex-col selection:bg-purple-100 selection:text-purple-950">`;

if (!home.includes('const homeSchema =')) {
    home = home.replace(homeReturn, homeSchemaStr + '\n' + homeReturn);
    home = home.replace('<SeoHead title="Glamzo | Plataforma & Agendamentos de Beleza Premium" description="Glamzo é a plataforma líder em beleza em Portugal. Agende cabeleireiro, barbeiro, manicures, estética e massagens online com rapidez e segurança." />', '<SeoHead title="Glamzo | Plataforma & Agendamentos de Beleza Premium" description="Glamzo é a plataforma líder em beleza em Portugal. Agende cabeleireiro, barbeiro, manicures, estética e massagens online com rapidez e segurança." schema={homeSchema} />');
    fs.writeFileSync('src/pages/Home.tsx', home);
    console.log("Added homeSchema to Home.tsx safely.");
}

// Explore.tsx
const exploreSchemaStr = `
const exploreSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://glamzo.pt/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Explorar Salões e Serviços",
      "item": "https://glamzo.pt/explore"
    }
  ]
};
`;
let explore = fs.readFileSync('src/pages/Explore.tsx', 'utf8');
const exploreReturn = `  return (
    <div className="min-h-[100vh] font-sans flex flex-col bg-slate-50">`;

if (!explore.includes('const exploreSchema =')) {
    explore = explore.replace(exploreReturn, exploreSchemaStr + '\n' + exploreReturn);
    explore = explore.replace('<SeoHead \n        title={t(\'explore.exploreTitle\') + " - Glamzo | Agendamentos de Beleza"} \n        description={t(\'explore.exploreDesc\')} \n      />', '<SeoHead \n        title={t(\'explore.exploreTitle\') + " - Glamzo | Agendamentos de Beleza"} \n        description={t(\'explore.exploreDesc\')} \n        schema={exploreSchema}\n      />');
    fs.writeFileSync('src/pages/Explore.tsx', explore);
    console.log("Added exploreSchema to Explore.tsx safely.");
}
