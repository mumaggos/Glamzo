const fs = require('fs');

const text = fs.readFileSync('src/i18n.ts', 'utf8');

// We will use string replacement to update EN, ES, FR sections
// This script is too large if we do it all by hand, but let's do it for EN first.
