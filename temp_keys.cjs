// Script to list all environment variable keys to find where the keys went
console.log(Object.keys(process.env).filter(key => 
  key.includes('SUPABASE') || 
  key.includes('STRIPE') || 
  key.includes('KEY') || 
  key.includes('PRICE') ||
  key.includes('PLAN') ||
  key.includes('URL') ||
  key.includes('SECRET')
));
