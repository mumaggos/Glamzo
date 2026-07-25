const fs = require('fs');

function fixLinks(file) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/<Link\b/g, '<LocalizedLink');
    content = content.replace(/<\/Link>/g, '</LocalizedLink>');
    fs.writeFileSync(file, content);
}

fixLinks('src/components/Navbar.tsx');
fixLinks('src/pages/Home.tsx');
console.log('Fixed links correctly');
