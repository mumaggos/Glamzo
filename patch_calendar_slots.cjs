const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardCalendar.tsx', 'utf8');

code = code.replace(/<div\s+key=\{b\.id\}\s+onClick=\{\(e\) => \{ e\.stopPropagation\(\); onBookingClick\(b\); \}\}\s+className=\{\`absolute inset-x-1 top-1 bottom-1/g,
`<div
                          key={b.id}
                          onClick={(e) => { e.stopPropagation(); onBookingClick(b); }}
                          style={{
                            top: \`\${(parseInt(b.start_time.split(':')[1] || '0') / 60) * 100}%\`,
                            height: \`\${( (parseInt(b.end_time.split(':')[0])*60 + parseInt(b.end_time.split(':')[1] || '0')) - (parseInt(b.start_time.split(':')[0])*60 + parseInt(b.start_time.split(':')[1] || '0')) ) / 60 * 100}%\`,
                            minHeight: '20px'
                          }}
                          className={\`absolute inset-x-1 bg-gradient-to-br`);

fs.writeFileSync('src/components/DashboardCalendar.tsx', code);
