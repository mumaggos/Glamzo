const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardCalendar.tsx', 'utf8');

// The computedHours useMemo
code = code.replace(
  /const computedHours = useMemo\(\(\) => \{([\s\S]*?)return Array\.from\(\{ length: len > 0 \? len : 14 \}, \(\_, i\) => i \+ minH\);\n  \}, \[businessHours\]\);/,
  `
  const { minH, maxH, computedHours } = useMemo(() => {
    const openH = businessHours.map((h) => {
      if (!h.open_time || h.is_closed) return 8;
      return parseInt(h.open_time.split(':')[0]);
    });
    const closeH = businessHours.map((h) => {
      if (!h.close_time || h.is_closed) return 20;
      return parseInt(h.close_time.split(':')[0]);
    });
    let minH = Math.min(...openH.filter(x => !isNaN(x)));
    let maxH = Math.max(...closeH.filter(x => !isNaN(x)));
    
    if (minH === Infinity) minH = 8;
    if (maxH === -Infinity) maxH = 20;
    
    const len = (maxH - minH) + 1;
    return {
      minH,
      maxH,
      computedHours: Array.from({ length: len > 0 ? len : 14 }, (_, i) => i + minH)
    };
  }, [businessHours]);
  `
);

code = code.replace(
  /const hours = computedHours;/g,
  'const hours = computedHours;'
);

fs.writeFileSync('src/components/DashboardCalendar.tsx', code);
