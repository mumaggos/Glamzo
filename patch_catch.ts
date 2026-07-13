import * as fs from 'fs';
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');

content = content.replace(
  /\} catch \(err\) \{/,
  "} catch (err) {\n        console.error('Fetch Business Catch Error:', err);"
);

fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
