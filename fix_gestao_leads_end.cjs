const fs = require('fs');
let content = fs.readFileSync('src/components/GestaoLeads.tsx', 'utf8');

// Find the last ChevronRight button
const idx = content.lastIndexOf('<ChevronRight className="w-4 h-4" />');
if (idx !== -1) {
  content = content.substring(0, idx + '<ChevronRight className="w-4 h-4" />'.length) + `
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
`;
  fs.writeFileSync('src/components/GestaoLeads.tsx', content);
}
