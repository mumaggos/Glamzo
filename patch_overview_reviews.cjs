const fs = require('fs');

let content = fs.readFileSync('src/pages/partner/tabs/OverviewTab.tsx', 'utf8');

const imports = /import \{ Business, Booking, Staff, Service \} from "\.\.\/\.\.\/\.\.\/types";/;
content = content.replace(imports, `import { Business, Booking, Staff, Service, Review } from "../../../types";\nimport { fetchReviewsForBusiness } from "../../../utils/reviewsHelper";`);

const compStart = /export default function OverviewTab\(\) \{/;
content = content.replace(compStart, `export default function OverviewTab() {\n  const [reviews, setReviews] = React.useState<Review[]>([]);\n  React.useEffect(() => {\n    if (business?.id) {\n      fetchReviewsForBusiness(business.id).then(res => setReviews(res || []));\n    }\n  }, [business?.id]);\n`);

const renderProp = /staff=\{staff \|\| \[\]\}/;
content = content.replace(renderProp, `staff={staff || []}\n         reviews={reviews}`);

fs.writeFileSync('src/pages/partner/tabs/OverviewTab.tsx', content);

let dashContent = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');
dashContent = dashContent.replace(/import \{ Business, Booking, Service, Staff \} from '\.\.\/types';/, `import { Business, Booking, Service, Staff, Review } from '../types';`);

dashContent = dashContent.replace(/staff: Staff\[\];/, `staff: Staff[];\n  reviews?: Review[];`);

dashContent = dashContent.replace(/staff,[\s\n]*resolvedSubscriptionStatus,/, `staff,\n  reviews = [],\n  resolvedSubscriptionStatus,`);

const reviewsUI = /<h3 className="text-xl font-black text-slate-400 mt-1">S\/ Dados<\/h3>[\s\n]*<p className="text-xs font-medium text-slate-500 mt-2">As avaliações da sua loja aparecerão aqui<\/p>/;

const newReviewsUI = `{reviews.length > 0 ? (
            <>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}</h3>
              <p className="text-xs font-medium text-slate-500 mt-2">Média de {reviews.length} avaliações</p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-black text-slate-400 mt-1">S/ Dados</h3>
              <p className="text-xs font-medium text-slate-500 mt-2">As avaliações da sua loja aparecerão aqui</p>
            </>
          )}`;

dashContent = dashContent.replace(reviewsUI, newReviewsUI);

fs.writeFileSync('src/components/DashboardOverview.tsx', dashContent);

