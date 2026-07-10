import fs from 'fs';

let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

content = content.replace(
  '<button type="button" key={star} onClick={() => setNewReviewRating(star)} className="text-amber-400 focus:outline-none cursor-pointer">',
  '<button type="button" key={star} aria-label={`Avaliar ${star} estrelas`} onClick={() => setNewReviewRating(star)} className="text-amber-400 focus:outline-none cursor-pointer">'
);

fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
