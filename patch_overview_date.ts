import fs from 'fs';
let code = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf-8');

code = code.replace(
  /const bDate = new Date\(b\.booking_date\);\n\s*const now = new Date\(\);\n\s*if \(timeFilter === 'today'\) \{\n\s*return bDate\.toDateString\(\) === now\.toDateString\(\);\n\s*\}/g,
  `const now = new Date();
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(now);
    if (timeFilter === 'today') {
      return b.booking_date === todayStr;
    }`
);

// We need to also fix week and month filters to use string comparison or safe dates
code = code.replace(
  /} else if \(timeFilter === 'week'\) {[\s\S]*?\} else if \(timeFilter === 'month'\) \{[\s\S]*?return bDate >= monthAgo;\n\s*\}/g,
  `} else if (timeFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return new Date(b.booking_date + "T12:00:00Z") >= weekAgo;
    } else if (timeFilter === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      return new Date(b.booking_date + "T12:00:00Z") >= monthAgo;
    }`
);


fs.writeFileSync('src/components/DashboardOverview.tsx', code);
