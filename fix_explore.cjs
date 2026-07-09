const fs = require('fs');
let text = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

text = text.replace(
`      if (loadedBiz.length === 0 || bizRes.error) {
        const { FALLBACK_BUSINESSES, FALLBACK_SERVICES, FALLBACK_REVIEWS, FALLBACK_HOURS } = await import("../utils/fallbackData");
        loadedBiz = FALLBACK_BUSINESSES;
        loadedServices = FALLBACK_SERVICES;
        loadedReviews = FALLBACK_REVIEWS;
        loadedHours = FALLBACK_HOURS;
      }`,
`      if (bizRes.error) {
        console.error("Explore fetch error:", bizRes.error);
      }`
);

fs.writeFileSync('src/pages/Explore.tsx', text);
