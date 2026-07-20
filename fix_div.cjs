const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');
content = content.replace(
  /<span>Sincronizar Produção<\/span>\s*<\/button>\s*<\/header>/g,
  `<span>Sincronizar Produção</span>
          </button>
          </div>
        </header>`
);
fs.writeFileSync('src/pages/Admin.tsx', content);
