const fs = require('fs');

let code = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

// Find the early return
const earlyReturnRegex = /\n  if \(\!isOpen\) return null;/;
const earlyReturnMatch = code.match(earlyReturnRegex);

if (earlyReturnMatch) {
  // Extract the hooks
  const hooksCode = `
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  
  const [couponApplied, setCouponApplied] = useState<any>(null);
  const [verifyingPromo, setVerifyingPromo] = useState(false);
`;

  // Remove the hooks from their original location
  code = code.replace(hooksCode, '');

  // Find the place to insert the hooks (just before the first useEffect, or at the end of the other state declarations)
  code = code.replace('const [successBooking, setSuccessBooking] = useState<any | null>(null);', 
    'const [successBooking, setSuccessBooking] = useState<any | null>(null);' + hooksCode);

  // Replace `slotStart += 30` with `slotStart += 15`
  code = code.replace(/for \(let slotStart = startMin; slotStart <= endMin - duration; slotStart \+= 30\) \{/,
    'for (let slotStart = startMin; slotStart <= endMin - duration; slotStart += 15) {');

  fs.writeFileSync('src/components/BookingModal.tsx', code);
  console.log("Fixed BookingModal.tsx");
} else {
  console.log("Could not find early return in BookingModal.tsx");
}
