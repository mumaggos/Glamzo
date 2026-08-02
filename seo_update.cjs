const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Insert sitemap route
const sitemapCode = `
    // Dynamic Sitemap Generator
    app.get("/sitemap.xml", async (req, res) => {
      res.setHeader("Content-Type", "application/xml");
      try {
        const { data: businesses } = await getSupabaseAdmin()
          .from("businesses")
          .select("slug, updated_at")
          .eq("status", "active")
          .eq("public_page_enabled", true);
          
        let xml = \`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\`;

        const baseUrl = 'https://glamzo.pt';
        const langs = ['pt', 'en', 'es', 'fr'];
        
        const addUrl = (path, priority, changefreq, lastmod) => {
          xml += \`\\n  <url>\\n    <loc>\${baseUrl}\${path}</loc>\\n    <changefreq>\${changefreq}</changefreq>\\n    <priority>\${priority}</priority>\`;
          if (lastmod) xml += \`\\n    <lastmod>\${lastmod.split('T')[0]}</lastmod>\`;
          
          // Add hreflang for each language
          langs.forEach(l => {
             const lPath = l === 'pt' ? path : \`/\${l}\${path === '/' ? '' : path}\`;
             xml += \`\\n    <xhtml:link rel="alternate" hreflang="\${l}" href="\${baseUrl}\${lPath}" />\`;
          });
          xml += \`\\n    <xhtml:link rel="alternate" hreflang="x-default" href="\${baseUrl}\${path}" />\`;
          
          xml += \`\\n  </url>\`;
        };

        // Static routes
        addUrl('/', '1.0', 'daily');
        addUrl('/explore', '0.9', 'hourly');
        addUrl('/sobre', '0.5', 'monthly');
        addUrl('/contactos', '0.5', 'monthly');
        addUrl('/parceiros', '0.8', 'weekly');
        
        // Dynamic business routes
        if (businesses) {
          businesses.forEach(b => {
             if (b.slug) {
                addUrl(\`/\${b.slug}\`, '0.8', 'daily', b.updated_at);
             }
          });
        }
        
        xml += \`\\n</urlset>\`;
        res.send(xml);
      } catch (err) {
        console.error("Sitemap error:", err);
        res.status(500).end();
      }
    });
`;

code = code.replace(
  '    // Fallback response for single-page routing',
  sitemapCode + '\\n    // Fallback response for single-page routing'
);

fs.writeFileSync('server.ts', code);
