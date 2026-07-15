with open("src/pages/partner/SetupWizard.tsx", "r") as f:
    text = f.read()

target_state = "const [successMsg, setSuccessMsg] = useState<string | null>(null);"
replacement_state = """const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [salesAgentId, setSalesAgentId] = useState<string | null>(null);

  useEffect(() => {
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

if "setSalesAgentId" not in text:
    text = text.replace(target_state, replacement_state)
    
with open("src/pages/partner/SetupWizard.tsx", "w") as f:
    f.write(text)

