const fs = require('fs');
let text = fs.readFileSync('src/pages/Home.tsx', 'utf8');

text = text.replace(
`        if (loadedBiz.length === 0 || bizRes.error) { 
          const { FALLBACK_BUSINESSES, FALLBACK_SERVICES, FALLBACK_REVIEWS } = await import("../utils/fallbackData"); 
          loadedBiz = FALLBACK_BUSINESSES; 
          srvData = FALLBACK_SERVICES; 
          revDataFinal = FALLBACK_REVIEWS; 
        } `,
`        if (bizRes.error) { 
          console.error("Home fetch error:", bizRes.error);
        }`
);

fs.writeFileSync('src/pages/Home.tsx', text);
