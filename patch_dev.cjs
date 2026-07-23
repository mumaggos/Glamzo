const fs = require('fs');
let code = fs.readFileSync('/app/applet/src/components/DeveloperPanel.tsx', 'utf8');

// Replace language buttons
code = code.replace(
  /<div className="flex gap-2">.*?<\/div>\s*<\/div>\s*\{\/\* Currency/s,
  `<div className="grid grid-cols-3 gap-2">
            <button onClick={() => setLanguage('pt')} className={\`py-2 text-sm font-bold rounded-lg transition-colors \${language === 'pt' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-slate-50 text-slate-600'}\`}>PT</button>
            <button onClick={() => setLanguage('en')} className={\`py-2 text-sm font-bold rounded-lg transition-colors \${language === 'en' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-slate-50 text-slate-600'}\`}>EN</button>
            <button onClick={() => setLanguage('es')} className={\`py-2 text-sm font-bold rounded-lg transition-colors \${language === 'es' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-slate-50 text-slate-600'}\`}>ES</button>
            <button onClick={() => setLanguage('fr')} className={\`py-2 text-sm font-bold rounded-lg transition-colors \${language === 'fr' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-slate-50 text-slate-600'}\`}>FR</button>
            <button onClick={() => setLanguage('de')} className={\`py-2 text-sm font-bold rounded-lg transition-colors \${language === 'de' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-slate-50 text-slate-600'}\`}>DE</button>
          </div>
        </div>
        {/* Currency`
);

// Replace location buttons
code = code.replace(
  /<div className="flex flex-col gap-2 pb-12">.*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/s,
  `<div className="flex flex-col gap-2 pb-12">
            <button onClick={() => { setUserLocation({ lat: 38.7223, lng: -9.1393 }); setLanguage('pt'); setCurrency('EUR'); }} className="w-full text-left px-4 py-3 text-sm font-bold bg-slate-50 text-slate-700 rounded-lg">📍 Lisboa (PT, EUR)</button>
            <button onClick={() => { setUserLocation({ lat: 48.8566, lng: 2.3522 }); setLanguage('fr'); setCurrency('EUR'); }} className="w-full text-left px-4 py-3 text-sm font-bold bg-slate-50 text-slate-700 rounded-lg">📍 Paris (FR, EUR)</button>
            <button onClick={() => { setUserLocation({ lat: 40.4168, lng: -3.7038 }); setLanguage('es'); setCurrency('EUR'); }} className="w-full text-left px-4 py-3 text-sm font-bold bg-slate-50 text-slate-700 rounded-lg">📍 Madrid (ES, EUR)</button>
            <button onClick={() => { setUserLocation({ lat: 52.5200, lng: 13.4050 }); setLanguage('de'); setCurrency('EUR'); }} className="w-full text-left px-4 py-3 text-sm font-bold bg-slate-50 text-slate-700 rounded-lg">📍 Berlim (DE, EUR)</button>
            <button onClick={() => { setUserLocation({ lat: 40.7128, lng: -74.0060 }); setLanguage('en'); setCurrency('USD'); }} className="w-full text-left px-4 py-3 text-sm font-bold bg-slate-50 text-slate-700 rounded-lg">📍 New York (EN, USD)</button>
             <button onClick={() => setUserLocation(null)} className="w-full text-left px-4 py-3 text-sm font-bold bg-rose-50 text-rose-700 rounded-lg mt-1">Limpar Localização</button>
          </div>
        </div>
      </div>
    </div>
  );
}`
);

fs.writeFileSync('/app/applet/src/components/DeveloperPanel.tsx', code);
