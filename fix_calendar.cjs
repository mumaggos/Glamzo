const fs = require('fs');

let code = fs.readFileSync('src/components/DashboardCalendar.tsx', 'utf8');

code = code.replace(
  /const minH = Math\.min\(\.\.\.openH\.filter\(x => !isNaN\(x\)\), 8\);/,
  'const minH = Math.min(...openH.filter(x => !isNaN(x)), Math.min(...openH)); // dynamic start'
);
code = code.replace(
  /const maxH = Math\.max\(\.\.\.closeH\.filter\(x => !isNaN\(x\)\), 20\);/,
  'const maxH = Math.max(...closeH.filter(x => !isNaN(x)), Math.max(...closeH)); // dynamic end'
);
code = code.replace(
  /if \(currentHour >= 8 && currentHour <= 21\) \{/g,
  'if (currentHour >= minH && currentHour <= maxH) {'
);
code = code.replace(
  /const scrollAmount = \(currentHour - 8\) \* 112;/g,
  'const scrollAmount = (currentHour - minH) * 112;'
);

fs.writeFileSync('src/components/DashboardCalendar.tsx', code);
