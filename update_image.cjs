const fs = require('fs');
let code = fs.readFileSync('src/components/Image.tsx', 'utf8');

code = code.replace(
  /\$\{fill \? \`object-\$\{objectFit\}\` : ''\}\s+\$\{!isLoaded && !priority \? 'blur-xl scale-110 grayscale' : 'blur-0 scale-100 grayscale-0'\}\s+transition-all duration-700 ease-out/g,
  `\${fill ? \`object-\${objectFit}\` : ''} \${!isLoaded && !priority ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ease-in-out`
);

fs.writeFileSync('src/components/Image.tsx', code);
