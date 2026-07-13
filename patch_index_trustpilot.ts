import * as fs from 'fs';
let content = fs.readFileSync('index.html', 'utf8');
if (!content.includes('trustpilot-one-time-domain-verification-id')) {
  content = content.replace(
    /<meta name="viewport" content="width=device-width, initial-scale=1\.0" \/>/,
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <meta name="trustpilot-one-time-domain-verification-id" content="2168efff-37bd-47fd-9d2f-46449d430906"/>'
  );
  fs.writeFileSync('index.html', content);
  console.log('Added trustpilot meta tag');
} else {
  console.log('Trustpilot meta tag already present');
}
