const fs = require('fs');
let code = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

// The original file probably had `couponDiscount`! Let's see how many times it appears.
code = code.replace(/const \[couponDiscount, setCouponDiscount\] = useState\(0\);\n/g, '');

// Re-add it just once with our injected block
code = code.replace(/const \[promoCode, setPromoCode\] = useState/, `const [couponDiscount, setCouponDiscount] = useState(0);\n  const [promoCode, setPromoCode] = useState`);

fs.writeFileSync('src/components/BookingModal.tsx', code);
