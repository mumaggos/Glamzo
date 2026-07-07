const fs = require('fs');

let code = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

// Find the ones left around line 100
code = code.replace(/const getWeekdayName = \(date: Date\) => \['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'\]\[date\.getDay\(\)\];\s+const \[couponDiscount, setCouponDiscount\] = useState\(0\);\s+const \[promoCode, setPromoCode\] = useState\(''\);\s+const \[promoError, setPromoError\] = useState<string \| null>\(null\);\s+const \[couponApplied, setCouponApplied\] = useState<any>\(null\);\s+const \[verifyingPromo, setVerifyingPromo\] = useState\(false\);/, 'const getWeekdayName = (date: Date) => [\'DOM\', \'SEG\', \'TER\', \'QUA\', \'QUI\', \'SEX\', \'SÁB\'][date.getDay()];');

fs.writeFileSync('src/components/BookingModal.tsx', code);
