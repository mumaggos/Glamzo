import fs from 'fs';

let content = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf-8');

const oldBlock = `    if (step === 1) {
      if (!name || !phone || !address || !city || !postalCode) {
        setErrorMsg('Preencha os campos obrigatórios.');
        return;
      }
      setLoading(true);
      try {
        let slug = business.slug;
        if (slug.startsWith('loja-') && name) {
          slug = await generateUniqueSlug(name);
        }
        const { error } = await supabase.from('businesses').update({
          name, phone, email, address, city, postal_code: postalCode, slug, setup_step: 2
        }).eq('id', business.id);
        
        if (error) {
          if (error.code === '42703' || error.message?.includes('setup_step')) {
            await supabase.from('businesses').update({ name, phone, email, address, city, postal_code: postalCode, slug }).eq('id', business.id);
          } else {
            throw error;
          }
        }
        setBusiness({ ...business, name, phone, email, address, city, postal_code: postalCode, slug, setup_step: 2 });
        setStep(2);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {`;

const newBlock = `    if (step === 1) {
      if (!name || !phone || !address || !city || !postalCode) {
        setErrorMsg('Preencha os campos obrigatórios.');
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

        let slug = business.slug;
        if (slug.startsWith('loja-') && name) {
          slug = await generateUniqueSlug(name);
        }
        const updateData = {
          name, phone, email, address, city, postal_code: postalCode, slug, setup_step: 2,
          category, logo_url: logoUrl, cover_url: coverUrl,
          latitude: lat, longitude: lng
        };
        const { error } = await supabase.from('businesses').update(updateData).eq('id', business.id);
        
        if (error) {
          if (error.code === '42703' || error.message?.includes('setup_step')) {
            delete (updateData as any).setup_step;
            await supabase.from('businesses').update(updateData).eq('id', business.id);
          } else {
            throw error;
          }
        }
        setBusiness({ ...business, ...updateData, setup_step: 2 });
        setStep(2);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {`;

content = content.replace(oldBlock, newBlock);

const uploadImageFunc = `
  const uploadImage = async (file: File, bucket: string, setter: (url: string) => void) => {
    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = \`\${Math.random()}.\${fileExt}\`;
      const filePath = \`\${user?.id}/\${fileName}\`;
      
      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      setter(data.publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erro ao fazer upload da imagem.');
    } finally {
      setUploadingImage(false);
    }
  };
`;

if (!content.includes('uploadImage = async')) {
  content = content.replace('const handleNext = async () => {', uploadImageFunc + '\n  const handleNext = async () => {');
}

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', content);

