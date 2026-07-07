const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/AgendaTab.tsx', 'utf8');

code = code.replace(
  /const toggleFullScreen = \(\) => \{[\s\S]*?setAgendaFullScreen\(false\);\n    \}\n  \};/g,
  `const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };`
);

code = code.replace(
  /<div className="flex-1 overflow-y-auto">[\s\S]*?<DashboardCalendar/g,
  (match) => match.replace(
    /<div className="flex-1 overflow-y-auto">/,
    `<div className={\`flex-1 overflow-y-auto \${agendaFullScreen ? 'bg-white p-6' : ''}\`} ref={containerRef}>`
  )
);

code = code.replace(
  /<DashboardCalendar\s*bookings=\{[^}]+\}\s*services=\{services\}\s*staff=\{staff\}/,
  `<DashboardCalendar 
          bookings={selectedStaffFilter === "all" ? bookings : bookings.filter(b => b.staff_id === selectedStaffFilter)}
          services={services}
          staff={staff}
          selectedStaffFilter={selectedStaffFilter}
          onStaffClick={(staffId) => setSelectedStaffFilter(staffId)}`
);

fs.writeFileSync('src/pages/partner/tabs/AgendaTab.tsx', code);
