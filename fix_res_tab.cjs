const fs = require('fs');
let text = fs.readFileSync('src/pages/partner/tabs/ReservationsTab.tsx', 'utf8');

const rowRegex = /<tr key=\{booking\.id\}[\s\S]*?<\/tr>/;
const rowMatch = text.match(rowRegex);

if (rowMatch) {
  const rowComponent = `
const ReservationRow = React.memo(({ booking }: { booking: any }) => {
  return (
    ${rowMatch[0].replace('key={booking.id} ', '')}
  );
});
`;
  text = text.replace(rowRegex, '<ReservationRow key={booking.id} booking={booking} />');
  text = text.replace('export default function ReservationsTab() {', rowComponent + '\nconst ReservationsTab = React.memo(function ReservationsTab() {');
  text = text.replace(/}\s*$/, '});\nexport default ReservationsTab;');
  fs.writeFileSync('src/pages/partner/tabs/ReservationsTab.tsx', text);
}
