const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

// 1. Add localStorage effect
const effectStr = `
  useEffect(() => {
    if (loading) return;
    const draft = { name, phone, email, address, doorNumber, city, district, postalCode, category, logoUrl };
    localStorage.setItem('setup_wizard_draft', JSON.stringify(draft));
  }, [name, phone, email, address, doorNumber, city, district, postalCode, category, logoUrl, loading]);
`;
if (!code.includes('setup_wizard_draft')) {
  code = code.replace("const handleHourChange = (weekday: number, field: string, value: any) => {", effectStr + "\n  const handleHourChange = (weekday: number, field: string, value: any) => {");
}

// 2. Read from localStorage
const loadTarget = `setName(currentBiz.name || '');
        setPhone(currentBiz.phone || '');
        setEmail(currentBiz.email || '');
        setAddress(currentBiz.address || '');
        setDoorNumber(currentBiz.door_number || '');
        setCity(currentBiz.city || '');
        setDistrict(currentBiz.district || '');
        setPostalCode(currentBiz.postal_code || '');
        setCategory(currentBiz.category || MAIN_CATEGORIES[0].name);
        setLogoUrl(currentBiz.logo_url || '');
        setCoverUrl(currentBiz.cover_url || '');`;

const loadReplacement = `
        const draftStr = localStorage.getItem('setup_wizard_draft');
        let draft: any = null;
        try { draft = draftStr ? JSON.parse(draftStr) : null; } catch (e) {}

        setName(currentBiz.name || draft?.name || '');
        setPhone(currentBiz.phone || draft?.phone || '');
        setEmail(currentBiz.email || draft?.email || '');
        setAddress(currentBiz.address || draft?.address || '');
        setDoorNumber(currentBiz.door_number || draft?.doorNumber || '');
        setCity(currentBiz.city || draft?.city || '');
        setDistrict(currentBiz.district || draft?.district || '');
        setPostalCode(currentBiz.postal_code || draft?.postalCode || '');
        setCategory(currentBiz.category || draft?.category || MAIN_CATEGORIES[0].name);
        setLogoUrl(currentBiz.logo_url || draft?.logoUrl || '');
        setCoverUrl(currentBiz.cover_url || '');
`;
code = code.replace(loadTarget, loadReplacement);

// 3. Update handleMagicSetup
const magicTarget = `onboarding_step: 3,
        setup_step: 4
      });`;
const magicReplacement = `onboarding_step: 3,
        setup_step: 4,
        manual_setup_requested: true
      });`;
code = code.replace(magicTarget, magicReplacement);

// Clear localStorage on completion
const completeTarget = `toast.success("Loja ativa e pronta a receber marcações!");`;
const completeReplacement = `localStorage.removeItem('setup_wizard_draft');
      toast.success("Loja ativa e pronta a receber marcações!");`;
code = code.replace(completeTarget, completeReplacement);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
console.log("SetupWizard.tsx patched!");
