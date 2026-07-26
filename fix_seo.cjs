const fs = require('fs');

// 1. Fix SeoHead.tsx
let seoContent = fs.readFileSync('src/components/SeoHead.tsx', 'utf8');

// Shorten descriptions if they are long
seoContent = seoContent.replace(
    "export default function SeoHead({ title, description, image, url, schema }: SeoHeadProps) {",
    "export default function SeoHead({ title, description, image, url, schema }: SeoHeadProps) {\n  const globalDesc = description.length > 155 ? description.substring(0, 152) + '...' : description;\n  const ogDesc = description.length > 120 ? description.substring(0, 117) + '...' : description;"
);

// Replace content={description} with content={globalDesc} and content={ogDesc}
seoContent = seoContent.replace(
    '<meta name="description" content={description} />',
    '<meta name="description" content={globalDesc} />'
);
seoContent = seoContent.replace(
    '<meta property="og:description" content={description} />',
    '<meta property="og:description" content={ogDesc} />'
);

// Change default image to logo
seoContent = seoContent.replace(
    'const ogImage = image || `${domain}/default-og.jpg`;',
    'const ogImage = image || `${domain}/favicon-v2.svg`;'
);

fs.writeFileSync('src/components/SeoHead.tsx', seoContent);


// 2. Fix Home.tsx (move SeoHead out of BusinessCard to top of Home)
let homeContent = fs.readFileSync('src/pages/Home.tsx', 'utf8');
homeContent = homeContent.replace(
    "      <SeoHead title={t('home.heroTitle1') + \" \" + t('home.heroTitle2')} description={t('home.heroSubtitle')} /> \n",
    ""
);

// Add SeoHead at the top of Home component return
homeContent = homeContent.replace(
    "  return ( \n    <div className=\"min-h-[100dvh]",
    "  return ( \n    <div className=\"min-h-[100dvh]\">\n      <SeoHead title=\"Glamzo | Plataforma & Agendamentos de Beleza Premium\" description=\"Glamzo é a plataforma líder em beleza em Portugal. Agende cabeleireiro, barbeiro, manicures, estética e massagens online com rapidez e segurança.\" />"
);
// wait, the div has other classes, let's just do a regex replace or string replace
homeContent = homeContent.replace(
    /<div className="min-h-\[100dvh\].*?flex-col.*?>/,
    `$&
      <SeoHead title="Glamzo | Plataforma & Agendamentos de Beleza Premium" description="Glamzo é a plataforma líder em beleza em Portugal. Agende cabeleireiro, barbeiro, manicures, estética e massagens online com rapidez e segurança." />`
);

fs.writeFileSync('src/pages/Home.tsx', homeContent);

// 3. Fix index.html description and og:image
let indexContent = fs.readFileSync('index.html', 'utf8');
indexContent = indexContent.replace(
    '<meta name="description" content="Glamzo é a plataforma líder em agendamentos de beleza em Portugal. Encontre e reserve os melhores salões de cabeleireiro, barbeiros, manicures, estéticas e massagens perto de si com rapidez e segurança." />',
    '<meta name="description" content="Glamzo é a plataforma líder em beleza em Portugal. Agende cabeleireiro, barbeiro, manicures, estética e massagens online com rapidez e segurança." />'
);
indexContent = indexContent.replace(
    '<meta property="og:description" content="Encontre e agende serviços de beleza com os melhores profissionais da sua região. Prático, rápido e seguro com suporte Stripe (MBWay, Cartões, e mais)." />',
    '<meta property="og:description" content="Agende serviços de beleza com os melhores profissionais. Rápido e seguro, 24/7 (MBWay e Cartões)." />'
);
indexContent = indexContent.replace(
    /<meta property="og:image" content=".*?" \/>/g,
    '<meta property="og:image" content="https://glamzo.pt/favicon-v2.svg" />'
);
indexContent = indexContent.replace(
    /<meta name="twitter:description" content=".*?" \/>/,
    '<meta name="twitter:description" content="Agende serviços de beleza com os melhores profissionais. Rápido e seguro, 24/7 (MBWay e Cartões)." />'
);
indexContent = indexContent.replace(
    /<meta name="twitter:image" content=".*?" \/>/,
    '<meta name="twitter:image" content="https://glamzo.pt/favicon-v2.svg" />'
);

fs.writeFileSync('index.html', indexContent);

// 4. Update server.ts
let serverContent = fs.readFileSync('server.ts', 'utf8');

// Change addressCountry to strictly 'PT'
serverContent = serverContent.replace(
    `"addressCountry": business.country || 'Portugal'`,
    `"addressCountry": "PT"`
);

// Shorten description in server.ts
serverContent = serverContent.replace(
    "const desc = `Reserve o seu agendamento na ${business.name} em ${business.city}. Verifique horários disponíveis, serviços e preços online no Glamzo.`;",
    "const desc = `Reserve o seu agendamento na ${business.name} em ${business.city}. Verifique horários, serviços e preços no Glamzo.`;"
);
serverContent = serverContent.replace(
    "const img = business.cover_url || business.logo_url || 'https://glamzo.pt/default-og.jpg';",
    "const img = business.cover_url || business.logo_url || 'https://glamzo.pt/favicon-v2.svg';"
);

fs.writeFileSync('server.ts', serverContent);
console.log("Done");
