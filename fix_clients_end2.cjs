const fs = require('fs');
let text = fs.readFileSync('src/pages/partner/tabs/ClientsTab.tsx', 'utf8');

// I will just find the last "}" and replace with "});"
// Wait, the end is literally:
//   );
// }
// });
// export default ClientsTab;
text = text.replace(/  \);\n\}\}\);\nexport default ClientsTab;/g, '  );\n});\nexport default ClientsTab;');
text = text.replace(/  \);\n\}\n\}\);\nexport default ClientsTab;/g, '  );\n});\nexport default ClientsTab;');
text = text.replace(/  \);\n\}\n\}\);\n\nexport default ClientsTab;/g, '  );\n});\nexport default ClientsTab;');

// Let's do something simpler
const lines = text.split('\n');
const fixedLines = [];
let braceCount = 0;
for (let i = lines.length - 1; i >= 0; i--) {
   if(lines[i].includes('});') || lines[i].includes('export default ClientsTab')) {
      continue;
   }
   if (lines[i] === '}') {
      if (braceCount === 0) {
         fixedLines.unshift('});');
         fixedLines.unshift('export default ClientsTab;');
         braceCount++;
      } else {
         fixedLines.unshift(lines[i]);
      }
   } else {
      fixedLines.unshift(lines[i]);
   }
}
fs.writeFileSync('src/pages/partner/tabs/ClientsTab.tsx', fixedLines.join('\n'));
