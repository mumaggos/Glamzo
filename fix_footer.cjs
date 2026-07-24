const fs = require('fs');
let content = fs.readFileSync('src/components/Footer.tsx', 'utf8');

// There are two </div> before </footer>, we need one less
content = content.replace("      </div>\n      </div>\n    </footer>", "      </div>\n    </footer>");
fs.writeFileSync('src/components/Footer.tsx', content);

