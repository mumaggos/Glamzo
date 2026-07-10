import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

const securityHeaders = `
// Security Headers Middleware
app.use((req, res, next) => {
  // We relax frame restrictions slightly to allow AI Studio previews, but tighten for production
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self' https: 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https: wss:;");
  next();
});

// Apply compression middleware to drastically shrink transfer size`;

content = content.replace('// Apply compression middleware to drastically shrink transfer size', securityHeaders);

fs.writeFileSync('server.ts', content);
