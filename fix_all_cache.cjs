const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const cacheSetup = `
let globalCachedIndexHtml = null;
async function getIndexHtml(distPath) {
  if (!globalCachedIndexHtml) {
    globalCachedIndexHtml = await require('fs').promises.readFile(require('path').join(distPath, "index.html"), 'utf8');
  }
  return globalCachedIndexHtml;
}
`;

// Inject cacheSetup right after `app.use(vite.middlewares); } else {`
code = code.replace(
  `app.use(vite.middlewares);
  } else {`,
  `app.use(vite.middlewares);
  } else {
${cacheSetup}`
);

code = code.replace(/await fs\.promises\.readFile\(indexPath, 'utf8'\)/g, 'await getIndexHtml(distPath)');

fs.writeFileSync('server.ts', code);
