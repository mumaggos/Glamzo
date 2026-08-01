const fs = require('fs');

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
const searchReturn = `  );
   return (
     <div className="min-h-[100vh]`;

if (home.includes(searchReturn)) {
    home = home.replace(searchReturn, '  );\n' + homeSchemaStr + '\n   return (\n     <div className="min-h-[100vh]');
    fs.writeFileSync('src/pages/Home.tsx', home);
    console.log("Added homeSchema to Home.tsx safely.");
} else {
    console.log("Could not find search string.");
}
