with open("src/pages/PartnerSignup.tsx", "r") as f:
    text = f.read()

target_imports = "import React, { useState } from 'react';"
replacement_imports = "import React, { useState, useEffect } from 'react';"
text = text.replace(target_imports, replacement_imports)

target_states = "const [successMsg, setSuccessMsg] = useState<string | null>(null);"
replacement_states = """const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (refCode) {
      // 1. Store in local storage for later when creating the business
      localStorage.setItem('sales_agent_ref', refCode);
      
      // 2. Increment clicks safely via RPC (if not already incremented in this session)
      if (!sessionStorage.getItem(`tracked_ref_${refCode}`)) {
        sessionStorage.setItem(`tracked_ref_${refCode}`, 'true');
        supabase.rpc('increment_agent_clicks', { agent_ref: refCode }).catch(console.error);
      }
    }
  }, [refCode]);"""
text = text.replace(target_states, replacement_states)

with open("src/pages/PartnerSignup.tsx", "w") as f:
    f.write(text)

