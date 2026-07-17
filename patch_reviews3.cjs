const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/PartnerReviewsTab.tsx', 'utf8');

content = content.replace("import React,\nimport toast from 'react-hot-toast';\n { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport toast from 'react-hot-toast';\n");

fs.writeFileSync('src/pages/partner/tabs/PartnerReviewsTab.tsx', content);
console.log("Fixed imports");
