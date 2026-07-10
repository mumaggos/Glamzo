import fs from 'fs';
let code = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

const target = "setBusiness(data as Business);";
const replacement = `setBusiness(data as Business);
            // Fetch business hours
            const { data: hoursData } = await supabase.from('business_hours').select('*').eq('business_id', data.id);
            if (hoursData) setBusinessHours(hoursData);
            
            // Fetch services
            const { data: servicesData } = await supabase.from('services').select('*').eq('business_id', data.id);
            if (servicesData) setServices(servicesData);
            
            // Fetch staff
            const { data: staffData } = await supabase.from('staff').select('*').eq('business_id', data.id);
            if (staffData) setStaff(staffData);
`;
code = code.replace(target, replacement);
fs.writeFileSync('src/pages/BusinessDetail.tsx', code);
console.log("Patched fetching for hours, services, staff.");
