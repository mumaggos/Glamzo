const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/StoreAssetsTab.tsx', 'utf8');

// Append ?ref=qr
code = code.replace(/const storeUrl = \`https:\/\/glamzo\.pt\/\$\{business\.slug\}\`;/, 'const storeUrl = `https://glamzo.pt/${business.slug}?ref=qr`;');

// Add stats section
const statsHTML = `
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-slate-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-purple-600" /> Estatísticas do QR Code
            </h4>
            <p className="text-xs text-slate-500 mt-1">Total de leituras (scans) pelos clientes</p>
          </div>
          <div className="bg-purple-50 text-purple-700 font-black text-2xl px-6 py-3 rounded-2xl">
            {business.qr_scans_count || 0}
          </div>
        </div>
`;

code = code.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-8">/, statsHTML + '\n      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">');

fs.writeFileSync('src/pages/partner/tabs/StoreAssetsTab.tsx', code);
