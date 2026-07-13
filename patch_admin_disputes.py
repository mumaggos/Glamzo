import re

with open("src/pages/Admin.tsx", "r") as f:
    content = f.read()

# Add states
states_injection = """  const [supportChats, setSupportChats] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [supportSubTab, setSupportSubTab] = useState<'messages' | 'disputes'>('messages');"""

content = re.sub(
    r"const \[supportChats, setSupportChats\] = useState<any\[\]>\(\[\]\);",
    states_injection,
    content
)

# Add fetch for disputes
fetch_injection = """      // Fetch disputes
      try {
        const { data: disputesData, error: disputesErr } = await supabase
          .from('disputes')
          .select('*, bookings(*), profiles!initiator_id(id, full_name, email, phone), businesses(id, name, phone, email)')
          .order('created_at', { ascending: false });

        if (!disputesErr && disputesData) {
          setDisputes(disputesData);
        }
      } catch (err) {
        console.warn('Fallback: Unable to fetch disputes', err);
      }
      
      // Fetch and sync real support messages"""

content = re.sub(
    r"\/\/ Fetch and sync real support messages",
    fetch_injection,
    content
)

with open("src/pages/Admin.tsx", "w") as f:
    f.write(content)

print("Patched state and fetch")
