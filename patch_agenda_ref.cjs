const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');

code = code.replace(
  /\) : \(\n        <DashboardCalendar/g,
  `) : (
        <div ref={containerRef} className={\`\${agendaFullScreen ? 'bg-white p-4 overflow-y-auto w-full h-full fixed inset-0 z-50' : 'w-full'}\`}>
        <DashboardCalendar`
);

code = code.replace(
  /setLoading\(false\);\n            \}\n          \}\}\n        \/>/g,
  `setLoading(false);
            }
          }}
        />
        </div>`
);

fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', code);
