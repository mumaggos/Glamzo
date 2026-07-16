const fs = require('fs');
let lines = fs.readFileSync('src/pages/Admin.tsx', 'utf8').split('\n');

for (let i = 2940; i < 2960; i++) {
  if (lines[i] && lines[i].includes('</main>')) {
    lines.splice(i, 0, "        </div>");
    break;
  }
}

// Ensure the last two lines are `  );\n}`
// Find `    </div>` at the end
let lastLine = lines.length - 1;
while(lines[lastLine].trim() === '') lastLine--;

lines.splice(lastLine + 1, 10,
  "  );",
  "}"
);

fs.writeFileSync('src/pages/Admin.tsx', lines.join('\n'));
console.log('Fixed end of file');
