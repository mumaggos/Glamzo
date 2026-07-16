const fs = require('fs');
let lines = fs.readFileSync('src/pages/Admin.tsx', 'utf8').split('\n');

for (let i = 2940; i < 2960; i++) {
  if (lines[i] && lines[i].includes('</table>')) {
    lines.splice(i+1, 10,
      "                        </div>",
      "                      )}",
      "                    </div>",
      "                  </div>",
      "                );",
      "              })()}",
      "        </div>",
      "      </main>"
    );
    break;
  }
}
fs.writeFileSync('src/pages/Admin.tsx', lines.join('\n'));
console.log('Fixed funnel end');
