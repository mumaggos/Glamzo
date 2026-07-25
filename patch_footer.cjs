const fs = require('fs');

let content = fs.readFileSync('src/components/Footer.tsx', 'utf8');

if (!content.includes('import { useLocation, useNavigate }')) {
  content = content.replace("import { useLocation }", "import { useLocation, useNavigate }");
}

const changeLanguageStart = content.indexOf('const changeLanguage');
const changeLanguageEnd = content.indexOf('};', changeLanguageStart) + 2;

const newChangeLanguage = `const navigate = useNavigate();
  const changeLanguage = (lng: string) => { 
     i18n.changeLanguage(lng);
     setIsLangOpen(false);
     
     // Build the new URL
     const pathParts = location.pathname.split('/');
     const supportedLangs = ['pt', 'en', 'es', 'fr'];
     let newPath = location.pathname;
     
     if (pathParts[1] && supportedLangs.includes(pathParts[1])) {
        pathParts[1] = lng;
        newPath = pathParts.join('/');
     } else {
        newPath = '/' + lng + (location.pathname === '/' ? '' : location.pathname);
     }
     if (lng === 'pt') {
       newPath = newPath.replace(/^\\/pt/, '') || '/';
     }
     navigate(newPath + location.search + location.hash, { replace: true });
  };`;

content = content.substring(0, changeLanguageStart) + newChangeLanguage + content.substring(changeLanguageEnd);

fs.writeFileSync('src/components/Footer.tsx', content);
console.log('Patched Footer.tsx');
