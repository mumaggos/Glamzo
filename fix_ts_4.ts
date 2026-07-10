import fs from 'fs';

let bd = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');
bd = bd.replace(
  /const input = \{\n\s*business_id: business\.id,\n\s*customer_id: user\.id,\n\s*rating: newReviewRating,\n\s*comment: newReviewComment,\n\s*\};\n\s*const created = await submitReview\(input as any\);/g,
  `const input: any = {
        business_id: business.id,
        customer_id: user.id,
        rating: newReviewRating,
        comment: newReviewComment,
      };
      const created = await submitReview(input as any);`
);

// If the previous replace didn't work (my regex was assuming input as any from my previous fix, wait, my previous fix was `await submitReview({ ...({} as any),`)
bd = bd.replace(
  /const created = await submitReview\(\{ \.\.\.\(\{\} as any\),/g,
  'const created = await submitReview(input as any); //'
);

fs.writeFileSync('src/pages/BusinessDetail.tsx', bd);
