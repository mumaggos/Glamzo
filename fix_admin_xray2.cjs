const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

if (!content.includes('<ClientXRayModal')) {
    const lines = content.split('\n');
    let idx = lines.length - 1;
    while (idx >= 0 && !lines[idx].includes('}')) {
        idx--;
    }
    // Now idx is the last line containing '}'. The one before it should be '  );' or '</div>'
    // I will just place it right before the last closing tags.
    const insertionPoint = content.lastIndexOf('</div>');
    if (insertionPoint !== -1) {
        content = content.slice(0, insertionPoint) + "\n      <ClientXRayModal isOpen={!!selectedClient} onClose={() => setSelectedClient(null)} client={selectedClient} onUpdate={() => { syncAdminDatasets(); }} />\n    " + content.slice(insertionPoint);
        fs.writeFileSync('src/pages/Admin.tsx', content);
        console.log("X-Ray modal successfully added at the end of Admin");
    }
}
