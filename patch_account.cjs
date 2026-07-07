const fs = require('fs');
let code = fs.readFileSync('src/pages/Account.tsx', 'utf8');

// Add import
if (!code.includes('import AccountMessages')) {
  code = code.replace(/import \{([^}]+)\} from 'lucide-react';/, "import { $1, MessageSquare } from 'lucide-react';\nimport AccountMessages from '../components/AccountMessages';");
}

// Add to desktop tabs
code = code.replace(
  "{ id: 'favoritos', icon: Heart, label: 'Favoritos' },",
  "{ id: 'mensagens', icon: MessageSquare, label: 'Mensagens' },\n            { id: 'favoritos', icon: Heart, label: 'Favoritos' },"
);

// Add content render block
code = code.replace(
  "{/* 4. SUPORTE E DISPUTAS */}",
  `{/* MENSAGENS */}
        {activeTab === 'mensagens' && (
          <div className="animate-fade-in h-[600px]">
             <AccountMessages />
          </div>
        )}
        
        {/* 4. SUPORTE E DISPUTAS */}`
);

fs.writeFileSync('src/pages/Account.tsx', code);
