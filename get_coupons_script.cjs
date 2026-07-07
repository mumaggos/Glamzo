const fs = require('fs');

let homeCode = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const fetchCouponsState = `
  const [promocoesAtivas, setPromocoesAtivas] = useState<any[]>([]);
`;

const fetchCouponsEffect = `
    const fetchPromocoes = async () => {
      try {
        const { data } = await supabase
          .from('business_coupons')
          .select('*, businesses(name, slug)')
          .eq('is_active', true)
          .limit(10);
        if (data) setPromocoesAtivas(data);
      } catch (e) {}
    };
    fetchPromocoes();
`;

// we need to inject this into Home.tsx
// Home.tsx starts with `export default function Home() {`
