const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/tabs/StaffTab.tsx', 'utf8');

// Update state to include email, phone
code = code.replace(
  /const \[staffForm, setStaffForm\] = useState\(\{[\s\S]*?off_days: "",\n  \}\);/,
  `const [staffForm, setStaffForm] = useState({
    full_name: "",
    role_title: "",
    avatar_url: "",
    is_active: true,
    off_days: [] as number[],
    email: "",
    phone: "",
    temp_password: "",
  });
  const [createdStaffAuth, setCreatedStaffAuth] = useState<{ email: string; temp_password: string; } | null>(null);`
);

// Update payload
code = code.replace(
  /const payload: any = \{[\s\S]*?off_days: staffForm.off_days \|\| null,\n      \};/,
  `const payload: any = {
        full_name: staffForm.full_name,
        role_title: staffForm.role_title || null,
        avatar_url: staffForm.avatar_url || null,
        is_active: staffForm.is_active,
        off_days: staffForm.off_days.join(','),
        email: staffForm.email || null,
        phone: staffForm.phone || null,
        temp_password: staffForm.temp_password || null,
      };`
);

// When creating staff, generate temp_password if not set, and capture it
code = code.replace(
  /payload.business_id = business.id;[\s\S]*?setGlobalSuccess\("Profissional contratado e registado com sucesso."\);/,
  `payload.business_id = business.id;
        const generatedPassword = payload.temp_password || Math.random().toString(36).slice(-8);
        payload.temp_password = generatedPassword;
        let { error } = await supabase.from("staff").insert(payload);
        if (error) {
          delete payload.off_days;
          const retry = await supabase.from("staff").insert(payload);
          error = retry.error;
        }
        if (error) throw error;
        setGlobalSuccess("Profissional contratado e registado com sucesso.");
        if (payload.email) {
          setCreatedStaffAuth({ email: payload.email, temp_password: generatedPassword });
        }`
);

// Reset form
code = code.replace(
  /<button\n\s*onClick=\{\(\) => \{\n\s*setEditingStaff\(null\);\n\s*setStaffForm\(\{\n\s*full_name: "",\n\s*role_title: "",\n\s*avatar_url: "",\n\s*is_active: true,\n\s*off_days: "",\n\s*\}\);/g,
  `<button
            onClick={() => {
              setEditingStaff(null);
              setCreatedStaffAuth(null);
              setStaffForm({
                full_name: "",
                role_title: "",
                avatar_url: "",
                is_active: true,
                off_days: [],
                email: "",
                phone: "",
                temp_password: "",
              });`
);

code = code.replace(
  /setEditingStaff\(st\);\n\s*setStaffForm\(\{\n\s*full_name: st.full_name,\n\s*role_title: st.role_title \|\| "",\n\s*avatar_url: st.avatar_url \|\| "",\n\s*is_active: st.is_active,\n\s*off_days: st.off_days \|\| "",\n\s*\}\);/g,
  `setEditingStaff(st);
                      setCreatedStaffAuth(null);
                      setStaffForm({
                        full_name: st.full_name,
                        role_title: st.role_title || "",
                        avatar_url: st.avatar_url || "",
                        is_active: st.is_active,
                        off_days: st.off_days ? st.off_days.split(',').map(Number).filter(n => !isNaN(n)) : [],
                        email: st.email || "",
                        phone: st.phone || "",
                        temp_password: st.temp_password || "",
                      });`
);

fs.writeFileSync('src/pages/partner/tabs/StaffTab.tsx', code);
