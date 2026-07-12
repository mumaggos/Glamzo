import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Account.tsx', 'utf8');

// Add imports
if (!content.includes("import { Link }")) {
  content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { Link } from 'react-router-dom';");
}

if (!content.includes("Compass")) {
  content = content.replace("ShoppingBag } from 'lucide-react';", "ShoppingBag, Compass } from 'lucide-react';");
}

// Add FAB
const fabHTML = `
      {/* Bottom Nav para Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t pb-safe pt-2 px-6 flex justify-between items-center z-[50] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        {[
          { id: 'reservas', icon: Calendar, label: 'Reservas' },
          { id: 'perfil', icon: UserCircle, label: 'Perfil' },
          { id: 'recompensas', icon: Gift, label: 'Prémios' },
          { id: 'favoritos', icon: Heart, label: 'Favoritos' },
          { id: 'suporte', icon: HelpCircle, label: 'Suporte' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={\`flex flex-col items-center p-2\`}
          >
            <tab.icon className={\`w-6 h-6 \${activeTab === tab.id ? 'text-purple-600' : 'text-slate-400'}\`} />
            <span className={\`text-[10px] font-bold mt-1 \${activeTab === tab.id ? 'text-purple-600' : 'text-slate-500'}\`}>{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* FAB - Explorar */}
      <Link to="/explore" className="fixed bottom-24 lg:bottom-10 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg shadow-purple-600/30 hover:bg-purple-700 hover:scale-105 transition-all z-50 flex items-center justify-center group">
        <Compass className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </Link>
`;

content = content.replace("      {/* Bottom Nav para Mobile */}", fabHTML.split("      {/* Bottom Nav para Mobile */}")[0] + "      {/* Bottom Nav para Mobile */}");

fs.writeFileSync('src/pages/Account.tsx', content);
