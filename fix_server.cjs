const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

const sitemapRoute = `
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const { data: businesses } = await getSupabaseAdmin()
        .from("businesses")
        .select("slug, updated_at")
        .eq("status", "active"); // Adjust if there's no status column, maybe is_active?
      
      let xml = \`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://glamzo.pt/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://glamzo.pt/explore</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>\`;

      if (businesses) {
        for (const biz of businesses) {
          if (!biz.slug) continue;
          xml += \`
  <url>
    <loc>https://glamzo.pt/\${biz.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>\`;
        }
      }
      xml += \`\\n</urlset>\`;
      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (err) {
      res.status(500).end();
    }
  });
`;

if (!server.includes('app.get("/sitemap.xml"')) {
  server = server.replace('async function startServer() {', 'async function startServer() {\n' + sitemapRoute);
}

// Ensure the wildcard route checks for slugs and injects SEO
const wildcardRoute = `    app.get("*", async (req, res) => {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      
      // Attempt SEO Injection for business routes
      try {
        const parts = req.path.split('/').filter(Boolean);
        let potentialSlug = null;
        
        if (parts.length === 1 && !['explore', 'login', 'signup', 'partner', 'admin', 'staff', 'dashboard'].includes(parts[0])) {
          potentialSlug = parts[0];
        } else if (parts.length === 2 && ['business', 'store'].includes(parts[0])) {
          potentialSlug = parts[1];
        } else if (parts.length === 2 && ['pt', 'en', 'es'].includes(parts[0]) && !['explore', 'login', 'signup', 'partner'].includes(parts[1])) {
          potentialSlug = parts[1];
        } else if (parts.length === 3 && ['pt', 'en', 'es'].includes(parts[0]) && ['business', 'store'].includes(parts[1])) {
          potentialSlug = parts[2];
        }

        if (potentialSlug && !req.path.includes('.')) { // Exclude files
          const { data: business } = await getSupabaseAdmin()
            .from('businesses')
            .select('name, city, address, door_number, postal_code, country, latitude, longitude, phone, cover_url, logo_url')
            .eq('slug', potentialSlug)
            .single();

          if (business) {
            const indexPath = path.join(distPath, "index.html");
            const htmlData = await fs.promises.readFile(indexPath, 'utf8');
            
            const title = \`\${business.name} - Reserva Online | Glamzo\`;
            const desc = \`Reserve o seu agendamento na \${business.name} em \${business.city}. Verifique horários disponíveis, serviços e preços online no Glamzo.\`;
            const img = business.cover_url || business.logo_url || 'https://glamzo.pt/default-og.jpg';
            const url = \`https://glamzo.pt/\${potentialSlug}\`;

            const metaTags = \`
              <title>\${title}</title>
              <meta name="description" content="\${desc}">
              <meta property="og:title" content="\${title}">
              <meta property="og:description" content="\${desc}">
              <meta property="og:url" content="\${url}">
              <meta property="og:site_name" content="Glamzo">
              <meta property="og:image" content="\${img}">
              <meta property="og:type" content="website">
              <meta name="twitter:card" content="summary_large_image">
            \`;

            const schema = {
              "@context": "https://schema.org",
              "@type": ["BeautySalon", "LocalBusiness"],
              "name": business.name,
              "image": img,
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
            
            const schemaTag = \`<script type="application/ld+json">\${JSON.stringify(schema)}</script>\`;

            let modifiedHtml = htmlData.replace('<head>', \`<head>\${metaTags}\${schemaTag}\`);
            modifiedHtml = modifiedHtml.replace(/<title>.*?<\\/title>/, '');
            
            return res.send(modifiedHtml);
          }
        }
      } catch (e) {}

      res.sendFile(path.join(distPath, "index.html"));
    });`;

if (!server.includes('meta property="og:site_name"')) {
  server = server.replace(
    'app.get("*", (req, res) => {\n      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");\n      res.sendFile(path.join(distPath, "index.html"));\n    });',
    wildcardRoute
  );
}

// Add fs to imports if not there
if (!server.includes("import fs from")) {
  server = server.replace('import path from "path";', 'import path from "path";\nimport fs from "fs";');
}

fs.writeFileSync('server.ts', server);
