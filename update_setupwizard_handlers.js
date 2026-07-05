import fs from 'fs';

let content = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf-8');

const handleNextReplacement = `
  const handleNext = async () => {
    if (step === 1) {
      if (!name || !email || !address || !city || !postalCode) {
        setErrorMsg('Por favor, preencha todos os campos obrigatórios da loja.');
        return;
      }
      setLoading(true);
      try {
        let lat = coordinates?.lat || null;
        let lng = coordinates?.lng || null;
        
        if (window.google?.maps && !lat) {
           try {
             const geocoder = new window.google.maps.Geocoder();
             const fullAddress = \`\${address}, \${postalCode} \${city}, Portugal\`;
             const result = await new Promise<any>((resolve, reject) => {
               geocoder.geocode({ address: fullAddress }, (results, status) => {
                 if (status === 'OK' && results?.[0]) resolve(results[0]);
                 else reject(new Error('Geocoding failed'));
               });
             });
             lat = result.geometry.location.lat();
             lng = result.geometry.location.lng();
           } catch(err) { console.warn('Geocoding failed', err); }
        } else if (!lat) {
           try {
             const fullAddress = \`\${address}, \${postalCode} \${city}, Portugal\`;
             const res = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(fullAddress)}\`);
             const data = await res.json();
             if (data && data.length > 0) {
               lat = parseFloat(data[0].lat);
               lng = parseFloat(data[0].lon);
             }
           } catch(err) { console.warn('Nominatim failed', err); }
        }

        const { error } = await supabase.from('businesses').update({ 
          name, phone, email, address, city, postal_code: postalCode,
          category, logo_url: logoUrl, cover_url: coverUrl,
          latitude: lat, longitude: lng,
          setup_step: 2 
        }).eq('id', business.id);
        
        if (error) throw error;
        setStep(2);
        window.scrollTo(0, 0);
      } catch (err: any) {
        setErrorMsg(err.message || 'Falha ao guardar dados da loja.');
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
`;

content = content.replace(
  "  const handleNext = async () => {\n    if (step === 1) {",
  handleNextReplacement + "\n    // __OLD_IF_REPLACED"
);

// We need to carefully replace the old block up to "} else if (step === 2) {"
// Let's do it safely.
