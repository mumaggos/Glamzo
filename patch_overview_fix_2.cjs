const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/OverviewTab.tsx', 'utf8');

const regex = /const \[reviews, setReviews\] = React\.useState<Review\[\]>\(\[\]\);\n  React\.useEffect\(\(\) => \{\n    if \(business\?\.id\) \{\n      fetchReviewsForBusiness\(business\.id\)\.then\(res => setReviews\(res \|\| \[\]\)\);\n    \}\n  \}, \[business\?\.id\]\);\n  const \{ business, bookings, services, staff \} = useOutletContext<PartnerContextType>\(\);/;

const replacement = `const { business, bookings, services, staff } = useOutletContext<PartnerContextType>();\n  const [reviews, setReviews] = React.useState<Review[]>([]);\n  React.useEffect(() => {\n    if (business?.id) {\n      fetchReviewsForBusiness(business.id).then(res => setReviews(res || []));\n    }\n  }, [business?.id]);`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/pages/partner/tabs/OverviewTab.tsx', content);
