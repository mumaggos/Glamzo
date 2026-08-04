const fs = require('fs');

let code = fs.readFileSync('src/pages/partner/tabs/FinanceTab.tsx', 'utf8');

code = code.replace(
  'import { Business } from "../../../types";',
  'import { Business } from "../../../types";\nimport FinanceSettingsTab from "./FinanceSettingsTab";\nimport PayoutsHistoryTab from "./PayoutsHistoryTab";\nimport HardwareManagerTab from "./HardwareManagerTab";\nimport { Landmark } from "lucide-react";'
);

code = code.replace(
  'export default function FinanceTab() {',
  'export default function FinanceTab() {\n  const [activeFinanceTab, setActiveFinanceTab] = useState<"overview" | "connect" | "payouts" | "terminal">("overview");'
);

fs.writeFileSync('src/pages/partner/tabs/FinanceTab.tsx', code);
