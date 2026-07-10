import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');
if (!code.includes('react-hot-toast')) {
  code = code.replace("import { BrowserRouter", "import { Toaster } from 'react-hot-toast';\nimport { BrowserRouter");
  code = code.replace("<BrowserRouter>", "<Toaster position=\"top-center\" />\n      <BrowserRouter>");
  fs.writeFileSync('src/App.tsx', code);
  console.log("Toaster added to App.tsx");
}
