import fs from 'fs';
let code = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

code = code.replace(
  /const input = \{\s*booking_id:[^}]+\};/g,
  `const input = {
        business_id: business.id,
        user_id: user.id,
        rating: newReviewRating,
        comment: newReviewComment,
      };`
);

fs.writeFileSync('src/pages/BusinessDetail.tsx', code);
