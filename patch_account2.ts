import * as fs from 'fs';

let content = fs.readFileSync('src/pages/Account.tsx', 'utf8');

const search = `      {/* Bottom Nav para Mobile */}`;

const replace = `
      {/* FAB - Explorar */}
      <Link to="/explorar" className="fixed bottom-24 lg:bottom-10 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg shadow-purple-600/30 hover:bg-purple-700 hover:scale-105 transition-all z-[60] flex items-center justify-center group">
        <Compass className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </Link>
      
      {/* Bottom Nav para Mobile */}`;

content = content.replace(search, replace);

fs.writeFileSync('src/pages/Account.tsx', content);
