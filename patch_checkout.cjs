const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /payment_method_collection: isTrialing \? "if_required" : "always",/g,
  'payment_method_collection: "always",'
);

fs.writeFileSync('server.ts', content);
