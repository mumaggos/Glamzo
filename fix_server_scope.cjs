const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Remove from inner
code = code.replace(
`let globalCachedIndexHtml = null;
async function getIndexHtml(distPath) {
  if (!globalCachedIndexHtml) {
    globalCachedIndexHtml = await require('fs').promises.readFile(require('path').join(distPath, "index.html"), 'utf8');
  }
  return globalCachedIndexHtml;
}`,
''
);

// Add to top
const topCode = `
let globalCachedIndexHtml: string | null = null;
async function getIndexHtml(distPath: string): Promise<string> {
  if (!globalCachedIndexHtml) {
    globalCachedIndexHtml = await require('fs').promises.readFile(require('path').join(distPath, "index.html"), 'utf8');
  }
  return globalCachedIndexHtml;
}
`;

code = code.replace(
  'const PORT = 3000;',
  topCode + '\nconst PORT = 3000;'
);

fs.writeFileSync('server.ts', code);
