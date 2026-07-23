const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// For terminal order:
const terminalOrderRegex = /app\.post\('\/api\/stripe\/terminal\/order', async \(req, res\) => \{([\s\S]*?)unit_amount: 9900, \/\/ 99 EUR \/ USD/m;
let match = content.match(terminalOrderRegex);
if (match) {
    const replacement = `app.post('/api/stripe/terminal/order', async (req, res) => {\n    const { businessId, currency = 'eur' } = req.body;\n${match[1].replace('const { businessId } = req.body;', '')}unit_amount: currency === 'usd' ? 10890 : 9900,`;
    content = content.replace(terminalOrderRegex, replacement);
    content = content.replace(
        'currency: "eur",',
        'currency: currency,'
    );
}

fs.writeFileSync('server.ts', content);
