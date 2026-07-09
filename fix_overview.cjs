const fs = require('fs');
let text = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');
text = text.replace("import React, { useMemo } from 'react';", "import React, { useMemo, useState, useEffect } from 'react';");
fs.writeFileSync('src/components/DashboardOverview.tsx', text);
