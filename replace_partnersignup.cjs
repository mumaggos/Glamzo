const fs = require('fs');
let code = fs.readFileSync('src/pages/PartnerSignup.tsx', 'utf8');

// Change step 2 rendering to inline
code = code.replace(
  `{step === 1 ? (`,
  `{/* Combined Form */}
          <form onSubmit={step === 1 ? handleNextStep : handleRegister} className="space-y-5 animate-fade-in">`
);

// We need to carefully remove the separate step rendering.
// It's easier to just overwrite PartnerSignup.tsx with the desired layout.
