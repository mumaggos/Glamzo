const fs = require('fs');

let content = fs.readFileSync('src/components/Footer.tsx', 'utf8');

content = content.replace("import React from 'react';", "import React, { useState, useRef, useEffect } from 'react';");
content = content.replace("import { useTranslation } from 'react-i18next';", "import { useTranslation } from 'react-i18next';\nimport { Globe, ChevronDown, ChevronUp } from 'lucide-react';");

const stateInject = `  const { t, i18n } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (lng: string) => { 
    i18n.changeLanguage(lng); 
    setIsLangOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const languages = [
    { code: 'pt', label: 'PT (Português)' },
    { code: 'en', label: 'EN (English)' },
    { code: 'es', label: 'ES (Español)' },
    { code: 'fr', label: 'FR (Français)' },
  ];

  const currentLangCode = (i18n.language || 'pt').split('-')[0].toLowerCase();
  const currentLang = languages.find(l => l.code === currentLangCode) || languages[0];
`;

content = content.replace("  const { t } = useTranslation();", stateInject);

const bottomBarInject = `
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500 font-mono">
          <div>Glamzo © {new Date().getFullYear()}. {t('footer.allRightsReserved')}</div>
          
          <div className="relative" ref={langRef}>
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{currentLang.label}</span>
              {isLangOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            
            {isLangOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={\`w-full text-left px-4 py-2.5 text-[12px] font-sans transition-colors \${currentLang.code === lang.code ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-700 hover:bg-slate-50'}\`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
`;

content = content.replace(/<div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-\[11px\] text-slate-500 font-mono">[\s\S]*?<\/div>\s*<\/div>/, bottomBarInject + "      </div>");

fs.writeFileSync('src/components/Footer.tsx', content);

