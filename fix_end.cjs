const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const regex = /      \)\}\n          <ClientXRayModal isOpen=\{!!selectedClient\} onClose=\{[^}]*\} client=\{selectedClient\} onUpdate=\{[^}]*\} \/>\n    <\/div>\n<\/main>\n\}\n  \);\n\}/g;

const repl = `      )}
          <ClientXRayModal isOpen={!!selectedClient} onClose={() => setSelectedClient(null)} client={selectedClient} onUpdate={() => { syncAdminDatasets(); }} />
    </div>
  );
}`;

content = content.replace(/<\/main>\n\}\n  \);\n\}/g, "  );\n}");

fs.writeFileSync('src/pages/Admin.tsx', content);
console.log('Fixed end of file');
