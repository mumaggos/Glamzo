const fs = require('fs');
let code = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf8');

// Needs useSearchParams
code = code.replace(/import \{ useParams, Link, useNavigate, useLocation \} from 'react-router-dom';/, `import { useParams, Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';`);

// Inside BusinessDetail
code = code.replace(/const location = useLocation\(\);/, `const location = useLocation();\n  const [searchParams] = useSearchParams();`);

const qrCodeLogic = `
  useEffect(() => {
    if (business && searchParams.get('ref') === 'qr') {
      const recorded = sessionStorage.getItem(\`qr_recorded_\${business.id}\`);
      if (!recorded) {
        sessionStorage.setItem(\`qr_recorded_\${business.id}\`, 'true');
        const currentScans = business.qr_scans_count || 0;
        supabase.from('businesses').update({ qr_scans_count: currentScans + 1 }).eq('id', business.id).then(() => {});
      }
    }
  }, [business, searchParams]);
`;

code = code.replace(/const loadBusiness = async \(\) => \{/, qrCodeLogic + '\n  const loadBusiness = async () => {');

fs.writeFileSync('src/pages/BusinessDetail.tsx', code);
