const fs = require('fs');
let code = fs.readFileSync('src/components/ClientXRayModal.tsx', 'utf8');

code = code.replace(
  "  const [referrer, setReferrer] = useState<any>(null);\n  const [saving, setSaving] = useState(false);",
  "  const [referrer, setReferrer] = useState<any>(null);\n  const [coupons, setCoupons] = useState<any[]>([]);\n  const [saving, setSaving] = useState(false);"
);

const fetchCoupons = `
      // Fetch coupons
      const { data: coupData } = await supabase
        .from('reward_coupons')
        .select('*')
        .eq('customer_id', client.id)
        .order('created_at', { ascending: false });
      setCoupons(coupData || []);

      // Fetch referrer if exists`;

code = code.replace("      // Fetch referrer if exists", fetchCoupons);

fs.writeFileSync('src/components/ClientXRayModal.tsx', code);
