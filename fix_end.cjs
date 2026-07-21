const fs = require('fs');
let content = fs.readFileSync('src/components/GestaoLeads.tsx', 'utf8');

content = content.replace(/\s*<\/div>\n\s*<\/div>\n\s*\)\;\n\s*\}\n*.*$/s, `
      </div>
    </div>
  );
}`);

fs.writeFileSync('src/components/GestaoLeads.tsx', content);
