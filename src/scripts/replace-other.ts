import fs from 'fs';
import path from 'path';

function fixFile(filePath: string) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch(e) {
    return;
  }
  
  content = content.replace(/fornecedor de serviço/gi, "profissional");
  content = content.replace(/Fornecedor de serviço/gi, "Profissional");
  content = content.replace(/via Stripe/g, "na plataforma");
  content = content.replace(/Checkout Seguro Stripe/g, "Checkout Seguro");
  content = content.replace(/Checkout Stripe/g, "Checkout");
  content = content.replace(/pagamentos pelo Stripe/g, "pagamentos seguros");
  content = content.replace(/no Supabase/g, "na plataforma");
  content = content.replace(/do Supabase/g, "da plataforma");

  fs.writeFileSync(filePath, content);
  console.log('Fixed', filePath);
}

fixFile(path.join(process.cwd(), 'src/pages/BusinessDetail.tsx'));
fixFile(path.join(process.cwd(), 'src/components/BookingModal.tsx'));
fixFile(path.join(process.cwd(), 'src/pages/Onboarding.tsx'));
fixFile(path.join(process.cwd(), 'src/pages/PartnerSignup.tsx'));

