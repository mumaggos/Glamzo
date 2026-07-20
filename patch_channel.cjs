const fs = require('fs');
let content = fs.readFileSync('src/components/partner/PartnerLayout.tsx', 'utf8');
content = content.replace(
  /\.on\('postgres_changes', \{ event: '\*', schema: 'public', table: 'messages', filter: \`receiver_id=eq\.\$\{business\.owner_id\}\` \}, payload => \{\n        \/\/ Trigger layout refresh on any message insert\/update \(like marking as read\)\n        loadLayoutData\(\);\n      \}\)/,
  `.on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: \`receiver_id=eq.\${business.owner_id}\` }, payload => {
        // Trigger layout refresh on any message insert/update (like marking as read)
        loadLayoutData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'disputes', filter: \`business_id=eq.\${business.id}\` }, payload => {
        // Trigger layout refresh on any dispute update
        loadLayoutData();
      })`
);
fs.writeFileSync('src/components/partner/PartnerLayout.tsx', content);
