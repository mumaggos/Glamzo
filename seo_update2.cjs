const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  '            const metaTags = `\\n              <title>${title}</title>\\n              <meta name="description" content="${desc}">\\n              <meta property="og:title" content="${title}">\\n              <meta property="og:description" content="${desc}">\\n              <meta property="og:url" content="${url}">\\n              <meta property="og:site_name" content="Glamzo">\\n              <meta property="og:image" content="${img}">\\n              <meta property="og:type" content="website">\\n              <meta name="twitter:card" content="summary_large_image">\\n            `;',
  `            const langs = ['pt', 'en', 'es', 'fr'];
            const hreflangTags = langs.map(l => {
              const lPath = l === 'pt' ? \`/\${potentialSlug}\` : \`/\${l}/\${potentialSlug}\`;
              return \`<link rel="alternate" hreflang="\${l}" href="https://glamzo.pt\${lPath}" />\`;
            }).join('\\n              ');
            const xDefault = \`<link rel="alternate" hreflang="x-default" href="https://glamzo.pt/\${potentialSlug}" />\`;

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
              \${hreflangTags}
              \${xDefault}
            \`;`
);

// We can also add default hreflang to all index.html served
code = code.replace(
  '      res.sendFile(path.join(distPath, "index.html"));',
  `      // For all other routes, let's also inject basic hreflang
      try {
         const indexPath = path.join(distPath, "index.html");
         let htmlData = await fs.promises.readFile(indexPath, 'utf8');
         const langs = ['pt', 'en', 'es', 'fr'];
         const parts = req.path.split('/').filter(Boolean);
         const currentLang = langs.includes(parts[0]) ? parts[0] : 'pt';
         let basePath = req.path;
         if (langs.includes(parts[0])) basePath = '/' + parts.slice(1).join('/');
         if (basePath === '//') basePath = '/';
         
         const hreflangTags = langs.map(l => {
            const lPath = l === 'pt' ? basePath : \`/\${l}\${basePath === '/' ? '' : basePath}\`;
            return \`<link rel="alternate" hreflang="\${l}" href="https://glamzo.pt\${lPath}" />\`;
         }).join('\\n    ');
         const xDefault = \`<link rel="alternate" hreflang="x-default" href="https://glamzo.pt\${basePath}" />\`;
         
         htmlData = htmlData.replace('<head>', \`<head>\\n    \${hreflangTags}\\n    \${xDefault}\`);
         return res.send(htmlData);
      } catch (err) {
         return res.sendFile(path.join(distPath, "index.html"));
      }`
);

fs.writeFileSync('server.ts', code);
