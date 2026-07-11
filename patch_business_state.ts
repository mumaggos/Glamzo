import fs from 'fs';
let content = fs.readFileSync('src/pages/BusinessDetail.tsx', 'utf-8');

const targetState = `  const [loadingReviews, setLoadingReviews] = useState(true);`;
const replaceState = `  const [loadingReviews, setLoadingReviews] = useState(true);

  // Review Filters & Pagination
  const [reviewFilterRating, setReviewFilterRating] = useState<number | null>(null);
  const [reviewSortOrder, setReviewSortOrder] = useState<'recent' | 'highest' | 'lowest'>('recent');
  const [showAllReviews, setShowAllReviews] = useState(false);`;
content = content.replace(targetState, replaceState);

fs.writeFileSync('src/pages/BusinessDetail.tsx', content);
