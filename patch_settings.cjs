const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/SettingsTab.tsx', 'utf8');

content = content.replace(
  /const \[formData, setFormData\] = useState\(\{\n\s*name: business\?\.name \|\| "",\n\s*address: business\?\.address \|\| "",\n\s*door_number: business\?\.door_number \|\| "",\n\s*postal_code: business\?\.postal_code \|\| "",\n\s*city: business\?\.city \|\| "",\n\s*phone: business\?\.phone \|\| "",\n\s*email: business\?\.email \|\| "",\n\s*\}\);/,
  `const [formData, setFormData] = useState({
    name: business?.name || "",
    address: business?.address || "",
    door_number: business?.door_number || "",
    postal_code: business?.postal_code || "",
    city: business?.city || "",
    phone: business?.phone || "",
    email: business?.email || "",
  });

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || "",
        address: business.address || "",
        door_number: business.door_number || "",
        postal_code: business.postal_code || "",
        city: business.city || "",
        phone: business.phone || "",
        email: business.email || "",
      });
    }
  }, [business]);`
);

fs.writeFileSync('src/pages/partner/tabs/SettingsTab.tsx', content);
