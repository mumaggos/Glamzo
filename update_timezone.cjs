const fs = require('fs');

// SetupWizard
let setup = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

if (!setup.includes("import { TimezoneSelect }")) {
  setup = setup.replace("import { Loader2, Plus, Minus", "import { TimezoneSelect } from '../../components/TimezoneSelect';\nimport { Loader2, Plus, Minus");
}

const setupRegex = /<select[\s\S]*?value=\{timezone\}[\s\S]*?onChange=\{e => setTimezone\(e\.target\.value\)\}[\s\S]*?className="(.*?)"[\s\S]*?>[\s\S]*?<\/select>/;
const setupMatch = setup.match(setupRegex);
if (setupMatch) {
  setup = setup.replace(setupMatch[0], `<TimezoneSelect value={timezone} onChange={setTimezone} className="${setupMatch[1]}" />`);
  fs.writeFileSync('src/pages/partner/SetupWizard.tsx', setup);
}

// SettingsTab
let settings = fs.readFileSync('src/pages/partner/tabs/SettingsTab.tsx', 'utf8');

if (!settings.includes("import { TimezoneSelect }")) {
  settings = settings.replace("import { Plus, Trash2", "import { TimezoneSelect } from '../../../components/TimezoneSelect';\nimport { Plus, Trash2");
}

const settingsRegex = /<select[\s\S]*?value=\{formData\.timezone\}[\s\S]*?onChange=\{\(e\) => setFormData\(\{ \.\.\.formData, timezone: e\.target\.value \}\)\}[\s\S]*?className="(.*?)"[\s\S]*?>[\s\S]*?<\/select>/;
const settingsMatch = settings.match(settingsRegex);
if (settingsMatch) {
  settings = settings.replace(settingsMatch[0], `<TimezoneSelect value={formData.timezone} onChange={(val) => setFormData({ ...formData, timezone: val })} className="${settingsMatch[1]}" />`);
  fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', settings);
}
