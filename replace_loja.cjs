const fs = require('fs');
const content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
const lines = content.split('\n');
const startIndex = lines.findIndex(line => line.includes('{activeTab === "loja" && ('));
const endIndex = lines.findIndex(line => line.includes('{activeTab === "terminal" && ('));

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `              {activeTab === "loja" && (
                <DashboardLoja 
                  business={business}
                  setBusiness={setBusiness}
                  bookings={bookings}
                  uniqueClientsCount={uniqueClientsMap.size}
                />
              )}`;
  lines.splice(startIndex, endIndex - startIndex, replacement);
  fs.writeFileSync('src/pages/Dashboard.tsx', lines.join('\n'));
  console.log("Successfully replaced loja view.");
} else {
  console.log("Could not find boundaries.");
}
