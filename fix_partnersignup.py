import re

with open("src/pages/PartnerSignup.tsx", "r") as f:
    text = f.read()

# Add ref parsing
ref_parse = """  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref');"""
text = text.replace("  const navigate = useNavigate();", ref_parse)

# Update navigates
text = text.replace("navigate('/partner/setup', { replace: true });", "navigate('/partner/setup' + (refCode ? '?ref=' + refCode : ''), { replace: true });")
text = text.replace("navigate('/partner/setup')", "navigate('/partner/setup' + (refCode ? '?ref=' + refCode : ''))")

with open("src/pages/PartnerSignup.tsx", "w") as f:
    f.write(text)
