with open("src/pages/BusinessDetail.tsx", "r") as f:
    text = f.read()

target = """    const fetchStatus = async () => {
      const { data } = await supabase.from('businesses').select('profiles!businesses_owner_id_fkey(last_active)').eq('id', id).single();
      const p = Array.isArray(data?.profiles) ? data?.profiles[0] : data?.profiles;
      if (p?.last_active) {
        const last = new Date(p.last_active).getTime();
        const now = new Date().getTime();
        setIsStoreOnline((now - last) < 5 * 60 * 1000);
      } else {
        setIsStoreOnline(false);
      }
    };"""

replacement = """    const fetchStatus = async () => {
      if (!id) return;
      const { data: bData } = await supabase.from('businesses').select('owner_id').eq('id', id).single();
      if (bData?.owner_id) {
        const { data: pData } = await supabase.from('profiles').select('last_active').eq('id', bData.owner_id).single();
        if (pData?.last_active) {
          const last = new Date(pData.last_active).getTime();
          const now = new Date().getTime();
          setIsStoreOnline((now - last) < 5 * 60 * 1000);
          return;
        }
      }
      setIsStoreOnline(false);
    };"""

text = text.replace(target, replacement)

with open("src/pages/BusinessDetail.tsx", "w") as f:
    f.write(text)
