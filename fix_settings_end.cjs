const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/SettingsTab.tsx', 'utf8');

const correctEnd = `
      </div>
    </div>
    </APIProvider>
  );
}`;

// I will just use regex to replace everything after the last `</div>`
content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\);\s*<\/APIProvider>\s*\);\s*}/g, '</div></div></div></APIProvider>);}');

fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', content);
