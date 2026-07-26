const fs = require('fs');
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');

if (!content.includes('import SeoHead')) {
  content = content.replace(
    "import ErrorBoundary from '../components/ErrorBoundary';",
    "import ErrorBoundary from '../components/ErrorBoundary';\nimport SeoHead from '../components/SeoHead';"
  );
}

const seoBlock = `
  const getSeoData = () => {
    if (!business) return null;
    const title = \`\${business.name} - Reserva Online | Glamzo\`;
    const desc = \`Reserve o seu agendamento na \${business.name} em \${business.city}. Verifique horários disponíveis, serviços e preços online no Glamzo.\`;
    const image = business.cover_url || business.logo_url || 'https://glamzo.pt/default-og.jpg';
    const schema = {
      "@context": "https://schema.org",
      "@type": ["BeautySalon", "LocalBusiness"],
      "name": business.name,
      "image": image,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": \`\${business.address} \${business.door_number || ''}\`.trim(),
        "addressLocality": business.city,
        "postalCode": business.postal_code,
        "addressCountry": business.country || 'Portugal'
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": business.latitude,
        "longitude": business.longitude
      },
      "telephone": business.phone,
      "priceRange": "€€"
    };
    return { title, desc, image, schema };
  };
  const seoData = getSeoData();
`;

// Insert seoBlock right after let finalReviewsCount = reviews.length;
content = content.replace(
  'let finalReviewsCount = reviews.length;',
  'let finalReviewsCount = reviews.length;\n' + seoBlock
);

// We need to inject the <SeoHead /> exactly inside the main return wrapper
const seoTag = `
      {seoData && <SeoHead title={seoData.title} description={seoData.desc} image={seoData.image} schema={seoData.schema} />}
`;

// Find the main return (after "hasValidSubscription")
const parts = content.split('  // Temporarily relaxed filter for testing');
if (parts.length > 1) {
  let bottomPart = parts[1];
  // The next return is the "Loja Indisponível"
  // The one after that is the real one.
  const mainReturnIndex = bottomPart.indexOf('return (', 200);
  if (mainReturnIndex !== -1) {
    const before = bottomPart.substring(0, mainReturnIndex + 8);
    const after = bottomPart.substring(mainReturnIndex + 8);
    parts[1] = before + seoTag + after;
  }
  content = parts.join('  // Temporarily relaxed filter for testing');
}

fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
