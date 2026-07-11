import fs from 'fs';
let content = fs.readFileSync('src/utils/reviewsHelper.ts', 'utf-8');

const targetFetch = `export async function fetchReviewsForBusiness(businessId: string): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching business reviews:', error);
      return [];
    }
    
    return data as Review[];
  } catch (err) {
    console.error('Error in fetchReviewsForBusiness:', err);
    return [];
  }
}`;

const replacementFetch = `export async function fetchReviewsForBusiness(businessId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching business reviews:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Calculate gamification stats
    const customerIds = Array.from(new Set(data.map((r: any) => r.customer_id).filter(Boolean)));
    let statsMap: Record<string, { total_reviews: number, total_photos: number }> = {};
    
    if (customerIds.length > 0) {
      const { data: allUserReviews } = await supabase
        .from('reviews')
        .select('customer_id, image_urls')
        .in('customer_id', customerIds);
        
      if (allUserReviews) {
        allUserReviews.forEach((ur: any) => {
          if (!statsMap[ur.customer_id]) {
            statsMap[ur.customer_id] = { total_reviews: 0, total_photos: 0 };
          }
          statsMap[ur.customer_id].total_reviews += 1;
          if (ur.image_urls && Array.isArray(ur.image_urls)) {
            statsMap[ur.customer_id].total_photos += ur.image_urls.length;
          }
        });
      }
    }

    const augmentedData = data.map((r: any) => ({
      ...r,
      customer_stats: statsMap[r.customer_id] || { total_reviews: 1, total_photos: r.image_urls?.length || 0 }
    }));
    
    return augmentedData;
  } catch (err) {
    console.error('Error in fetchReviewsForBusiness:', err);
    return [];
  }
}`;

content = content.replace(targetFetch, replacementFetch);
fs.writeFileSync('src/utils/reviewsHelper.ts', content);
