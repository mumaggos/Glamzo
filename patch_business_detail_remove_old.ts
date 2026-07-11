import fs from 'fs';
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

const targetOld = `  const handlePhotoUploadLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewReviewFileBlob(reader.result as string);
      reader.readAsDataURL(file);
    }
  };`;

content = content.replace(targetOld, '');
fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
