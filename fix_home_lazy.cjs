const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

if (!code.includes('lazyWithRetry')) {
  code = code.replace(
    "import React, { Suspense, lazy, useState, useEffect, useMemo } from 'react';",
    "import React, { Suspense, lazy, useState, useEffect, useMemo } from 'react';\nimport { lazyWithRetry } from '../utils/lazyImport';"
  );
  code = code.replace(/lazy\(\(\) => import\(/g, "lazyWithRetry(() => import(");
  fs.writeFileSync('src/pages/Home.tsx', code);
}
