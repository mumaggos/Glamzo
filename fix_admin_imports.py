with open("src/pages/Admin.tsx", "r") as f:
    text = f.read()

text = text.replace(
    "import React,\nimport UniversalInbox from '../components/UniversalInbox';\nimport UniversalDisputes from '../components/UniversalDisputes';\n { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport UniversalInbox from '../components/UniversalInbox';\nimport UniversalDisputes from '../components/UniversalDisputes';"
)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(text)
