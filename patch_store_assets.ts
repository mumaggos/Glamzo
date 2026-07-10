import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/tabs/StoreAssetsTab.tsx', 'utf-8');

code = code.replace(
  /<div className="text-left">\n\s*<span className="block text-\[10px\] font-black uppercase tracking-widest text-rose-500">Visitas Totais<\/span>\n\s*<span className="text-xl font-black text-rose-700">\{\(business as any\)\.qr_scans_count \|\| 0\}<\/span>\n\s*<\/div>\n\s*<QrCode className="w-6 h-6 text-rose-200" \/>\n\s*<\/div>/,
  `<div className="text-left">
              <span className="block text-[10px] font-black uppercase tracking-widest text-rose-500">QR Scans</span>
              <span className="text-xl font-black text-rose-700">{(business as any).qr_scans_count || 0}</span>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="block text-[10px] font-black uppercase tracking-widest text-purple-500">Page Views</span>
              <span className="text-xl font-black text-purple-700">{(business as any).page_views || 0}</span>
            </div>
          </div>`
);

fs.writeFileSync('src/pages/partner/tabs/StoreAssetsTab.tsx', code);
