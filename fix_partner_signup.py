with open("src/pages/PartnerSignup.tsx", "r") as f:
    text = f.read()

target = "supabase.rpc('increment_agent_clicks', { agent_ref: refCode }).catch(console.error);"
replacement = """const trackClick = async () => {
          try {
            await supabase.rpc('increment_agent_clicks', { agent_ref: refCode });
          } catch (e) { console.error(e); }
        };
        trackClick();"""
        
if target in text:
    text = text.replace(target, replacement)
    
with open("src/pages/PartnerSignup.tsx", "w") as f:
    f.write(text)

