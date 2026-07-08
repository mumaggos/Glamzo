const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/OverviewTab.tsx', 'utf8');

const regex = /const \[reviews, setReviews\] = React\.useState<Review\[\]>\(\[\]\);\n\s*React\.useEffect\(\(\) => \{\n\s*if \(business\?\.id\) \{\n\s*fetchReviewsForBusiness\(business\.id\)\.then\(res => setReviews\(res \|\| \[\]\)\);\n\s*\}\n\s*\}, \[business\?\.id\]\);\n\s*const \{ business, bookings, services, staff \} = useOutletContext<PartnerContextType>\(\);/g;

const replacement = `const { business, bookings, services, staff } = useOutletContext<PartnerContextType>();\n  const [reviews, setReviews] = React.useState<Review[]>([]);\n  React.useEffect(() => {\n    if (business?.id) {\n      fetchReviewsForBusiness(business.id).then(res => setReviews(res || []));\n    }\n  }, [business?.id]);`;

let newContent = content.replace(regex, replacement);
fs.writeFileSync('src/pages/partner/tabs/OverviewTab.tsx', newContent);
