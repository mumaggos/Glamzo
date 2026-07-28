import fs from 'fs';
let code = fs.readFileSync('src/components/ProtectedRoute.tsx', 'utf8');

code = code.replace(/const path = location.pathname;/, 
`let path = location.pathname;
    const pathParts = path.split('/');
    if (pathParts[1] && ['pt', 'en', 'es', 'fr'].includes(pathParts[1])) {
      path = '/' + pathParts.slice(2).join('/');
    }
    if (path === '//' || path === '') path = '/';`);

fs.writeFileSync('src/components/ProtectedRoute.tsx', code);
