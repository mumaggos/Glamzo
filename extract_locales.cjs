const fs = require('fs');

const content = fs.readFileSync('src/i18n.ts', 'utf8');

// The file looks like:
// import i18n from 'i18next';
// ...
// i18n.use(...).init({
//    resources: {
//      "en": { ... },
//      "es": { ... },
//      "fr": { ... },
//      "pt": { ... }
//    },
//    fallbackLng: ...
// });

// Use a regex to extract the `resources: { ... }` object
// Since JSON parsing might be hard with a simple regex due to nested braces, 
// let's just evaluate the object. But we need to be careful with syntax.

// Let's find the start of resources:
const startIdx = content.indexOf('resources: {');
if (startIdx === -1) {
    console.error("Could not find 'resources: {'");
    process.exit(1);
}

// Find the matching closing brace for resources
let braceCount = 0;
let endIdx = -1;
let started = false;

for (let i = startIdx; i < content.length; i++) {
    if (content[i] === '{') {
        braceCount++;
        started = true;
    } else if (content[i] === '}') {
        braceCount--;
    }
    
    if (started && braceCount === 0) {
        endIdx = i;
        break;
    }
}

if (endIdx === -1) {
    console.error("Could not find end of resources object");
    process.exit(1);
}

const resourcesStr = content.substring(startIdx + 11, endIdx + 1);

// We can write a temporary file to evaluate this
const evalScript = `
const fs = require('fs');
const resources = ${resourcesStr};
if (!fs.existsSync('public/locales/en')) fs.mkdirSync('public/locales/en', { recursive: true });
if (!fs.existsSync('public/locales/es')) fs.mkdirSync('public/locales/es', { recursive: true });
if (!fs.existsSync('public/locales/fr')) fs.mkdirSync('public/locales/fr', { recursive: true });
if (!fs.existsSync('public/locales/pt')) fs.mkdirSync('public/locales/pt', { recursive: true });

for (const lng in resources) {
    if (resources[lng] && resources[lng].translation) {
        fs.writeFileSync(\`public/locales/\${lng}/translation.json\`, JSON.stringify(resources[lng].translation, null, 2));
    }
}
`;

fs.writeFileSync('eval_locales.cjs', evalScript);
console.log("Wrote eval script");

