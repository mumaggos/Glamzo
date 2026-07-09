const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');

text = text.replace(
  "}, [location.pathname, user, profile, loading, signOut]);",
  "}, [location.pathname, user, profile, loading, signOut, navigate]);"
);

fs.writeFileSync('src/App.tsx', text);
