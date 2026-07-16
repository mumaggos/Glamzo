const fs = require('fs');
let lines = fs.readFileSync('src/pages/Admin.tsx', 'utf8').split('\n');

for (let i=0; i<lines.length; i++) {
  if (lines[i].includes("message: 'O seu Glamzo Terminal foi enviado via CTT!'")) {
    lines[i+1] = "          });";
  }
  if (lines[i].includes("glamzo_points: currentPoints + pointsAllocVal")) {
    lines[i+1] = "        });";
  }
}

fs.writeFileSync('src/pages/Admin.tsx', lines.join('\n'));
console.log('Fixed fetch closings');
