const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/ReservationsTab.tsx', 'utf8');

const regex = /\{ id: "mes", label: "Mês" \},\n\s*\{ id: "todas", label: "Todas" \}/;
const replacement = `{ id: "mes", label: "Mês" },
            { id: "pendentes", label: "Pendentes" },
            { id: "todas", label: "Todas" }`;

content = content.replace(regex, replacement);

const filterLogic = /if \(filter === "mes"\) return b\.booking_date >= startOfMonthStr;\n\s*return true;/;
const filterReplacement = `if (filter === "mes") return b.booking_date >= startOfMonthStr;
      if (filter === "pendentes") return b.booking_status === "pending";
      return true;`;

content = content.replace(filterLogic, filterReplacement);

fs.writeFileSync('src/pages/partner/tabs/ReservationsTab.tsx', content);
