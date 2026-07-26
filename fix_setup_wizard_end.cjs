const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

content = content.replace(
`    </div>
    </>
  );
}`,
`    </div>
    </APIProvider>
  );
}
export default SetupWizard;`
);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', content);
