const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardCalendar.tsx', 'utf8');

code = code.replace(
  /\/\* Time column fixed width \*\//,
  `/* Time column fixed width */
          .fc-timegrid-axis { width: 50px !important; }
          .fc-timegrid-slot-label-cushion { padding-right: 8px !important; }
          .fc-scroller-liquid-absolute { overflow-x: auto !important; }
          .fc-timegrid-body { min-width: 600px; } /* Ensures scroll on small screens */`
);

code = code.replace(
  /nowIndicator=\{true\}/,
  `nowIndicator={true}
        dayMinWidth={120}`
);

fs.writeFileSync('src/components/DashboardCalendar.tsx', code);
