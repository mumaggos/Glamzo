with open("src/pages/partner/SetupWizard.tsx", "r") as f:
    text = f.read()

target_load = "const [slug, setSlug] = useState('');"
replacement_load = """const [slug, setSlug] = useState('');
  const [salesAgentId, setSalesAgentId] = useState<string | null>(null);

  useEffect(() => {
    // Resolve sales agent ID before completing setup
    const resolveSalesAgent = async () => {
      const storedRef = localStorage.getItem('sales_agent_ref');
      if (storedRef) {
        const { data } = await supabase.from('sales_agents').select('id').eq('ref_code', storedRef).maybeSingle();
        if (data) {
          setSalesAgentId(data.id);
        }
      }
    };
    resolveSalesAgent();
  }, []);"""

if target_load in text:
    text = text.replace(target_load, replacement_load)

target_payload = """        const payload = {
          owner_id: user.id,
          name: '',
          email: user.email || '',
          phone: '',
          address: '',
          city: '',
          district: '', 
          postal_code: '',
          status: 'setup',
          setup_step: 1,
          setup_completed: false,
          slug: slug,
          category: 'Cabelo & Barbearia'
        };"""

replacement_payload = """        const payload: any = {
          owner_id: user.id,
          name: '',
          email: user.email || '',
          phone: '',
          address: '',
          city: '',
          district: '', 
          postal_code: '',
          status: 'setup',
          setup_step: 1,
          setup_completed: false,
          slug: slug,
          category: 'Cabelo & Barbearia'
        };
        
        if (salesAgentId) {
          payload.agent_id = salesAgentId;
        }
"""
if "payload.agent_id = salesAgentId" not in text:
    text = text.replace(target_payload, replacement_payload)
    
with open("src/pages/partner/SetupWizard.tsx", "w") as f:
    f.write(text)

