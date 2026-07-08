const fs = require('fs');
const content = fs.readFileSync('src/emails/GlamzoTemplates.tsx', 'utf8');

const newStyles = `
const infoCardStyles = {
  backgroundColor: '#f3f4f6',
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '24px',
};
`;

let newContent = content.replace('const hrStyles = {', newStyles + '\nconst hrStyles = {');
newContent = newContent.replace('dividerStyles', 'hrStyles');

fs.writeFileSync('src/emails/GlamzoTemplates.tsx', newContent);
