import fs from 'fs';

let content = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf-8');

// We need to add the imports for categories
if (!content.includes('MAIN_CATEGORIES')) {
  content = content.replace(
    "import { generateUniqueSlug } from '../../utils/slugify';",
    "import { generateUniqueSlug } from '../../utils/slugify';\nimport { MAIN_CATEGORIES } from '../../utils/categoriesData';"
  );
}

// Add state for category, cover_url, logo_url
content = content.replace(
  "const [postalCode, setPostalCode] = useState('');",
  "const [postalCode, setPostalCode] = useState('');\n  const [category, setCategory] = useState(MAIN_CATEGORIES[0].name);\n  const [logoUrl, setLogoUrl] = useState('');\n  const [coverUrl, setCoverUrl] = useState('');\n  const [uploadingImage, setUploadingImage] = useState(false);\n  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);"
);

// Populate state when fetching business
content = content.replace(
  "setPostalCode(currentBiz.postal_code || '');",
  "setPostalCode(currentBiz.postal_code || '');\n        setCategory(currentBiz.category || MAIN_CATEGORIES[0].name);\n        setLogoUrl(currentBiz.logo_url || '');\n        setCoverUrl(currentBiz.cover_url || '');\n        setCoordinates({ lat: currentBiz.latitude, lng: currentBiz.longitude });"
);

// We need to update the handleNextStep1 to save these to the database and geocode the address
const handleNextStep1Replacement = `
  const handleNextStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !address || !city || !postalCode) {
      setErrorMsg('Preencha todos os campos obrigatórios.');
      return;
    }
    setLoading(true);
    try {
      let lat = coordinates?.lat || null;
      let lng = coordinates?.lng || null;
      
      // Attempt to geocode if no coordinates or address changed
      if (window.google?.maps) {
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
      } else {
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

      const { error } = await supabase
        .from('businesses')
        .update({
          name, phone, email, address, city, postal_code: postalCode,
          category, logo_url: logoUrl, cover_url: coverUrl,
          latitude: lat, longitude: lng,
          setup_step: 2
        })
        .eq('id', business.id);
      
      if (error) throw error;
      setStep(2);
      window.scrollTo(0, 0);
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocorreu um erro ao guardar os dados.');
    } finally {
      setLoading(false);
    }
  };

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

content = content.replace(
  "const handleNextStep1 = async (e: React.FormEvent) => {",
  handleNextStep1Replacement + "\n  const __oldHandleNextStep1 = async (e: React.FormEvent) => {"
);

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', content);

