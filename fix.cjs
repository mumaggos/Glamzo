const fs = require('fs');
let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');

home = home.replace(`        "https://www.facebook.com/glamzo.pt"
      ]
    }
  ]

   return (`, `        "https://www.facebook.com/glamzo.pt"
      ]
    }
  ]
};

   return (`);

fs.writeFileSync('src/pages/Home.tsx', home);
