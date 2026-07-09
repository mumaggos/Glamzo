const fs = require('fs');
let text = fs.readFileSync('src/pages/Login.tsx', 'utf8');

text = text.replace(
  "      } else if (profile.role === 'business') {\n        navigate('/dashboard', { replace: true });\n      } else {\n        navigate('/account', { replace: true });\n      }",
  "      } else if (profile.role === 'business') {\n        navigate('/partner/dashboard', { replace: true });\n      } else if (profile.role === 'staff') {\n        navigate('/staff/dashboard', { replace: true });\n      } else {\n        navigate('/account', { replace: true });\n      }"
);

fs.writeFileSync('src/pages/Login.tsx', text);
