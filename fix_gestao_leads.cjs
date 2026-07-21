const fs = require('fs');
let content = fs.readFileSync('src/components/GestaoLeads.tsx', 'utf8');

// I might have removed one closing div that was needed.
// Wait, the return starts with <div className="space-y-6">
// Then <div className="grid ...">
// So at the end, it should be:
/*
      </div>
    </div>
  );
}
*/
// But my regex replaced two divs with:
/*
      {/* Global Leads List * /}
      <div className="bg-white p-6 ...">
        ...
      </div>
    </div>
  );
}
*/
// Wait! I replaced two </div> with one </div> and the `</div>` from `space-y-6`. Let me fix it by wrapping my new div inside the outer `space-y-6` div, and keeping both closing divs.
content = content.replace(
  /      <\/div>\n    <\/div>\n  \);\n\}/,
  `      </div>
      </div>
    </div>
  );
}`
);

fs.writeFileSync('src/components/GestaoLeads.tsx', content);
