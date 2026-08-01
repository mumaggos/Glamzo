import fs from 'fs';
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

code = code.replace(/import React, \{ useState, useEffect \} from 'react';/, "import React, { useState, useEffect, useMemo } from 'react';");
code = code.replace(/import \{ Building2, Scissors, CreditCard/, "import { AlertCircle, Building2, Scissors, CreditCard");

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
