import fs from 'fs';
let content = fs.readFileSync('src/components/DashboardCalendar.tsx', 'utf-8');

const target = `let clientName = "Cliente";
                      if (b.customer_profile?.full_name) {
                        clientName = b.customer_profile.full_name;
                      } else if (b.notes && !isBlock) {
                        const noteParts = b.notes.split('\\n');
                        if (noteParts[0].includes('Manual:')) { 
                           clientName = noteParts[0].replace('Manual:', '').trim().split(' ')[0];
                        }
                      }`;

const replacement = `let clientName = "Cliente";
                      if (b.customer?.full_name) {
                        clientName = b.customer.full_name;
                      } else if (b.customer_profile?.full_name) {
                        clientName = b.customer_profile.full_name;
                      } else if (b.notes && !isBlock) {
                        const noteParts = b.notes.split('\\n');
                        if (noteParts[0].includes('Manual:')) { 
                           clientName = noteParts[0].replace('Manual:', '').trim().split(' ')[0];
                        }
                      }`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/DashboardCalendar.tsx', content);
