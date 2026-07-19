import { supabase } from '../lib/supabase';
import { Review } from '../types';

export async function fetchAllReviews(): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
    
    return data as Review[];
  } catch (err) {
    console.error('Error in fetchAllReviews:', err);
    return [];
  }
}

export async function fetchReviewsForBusiness(businessId: string): Promise<any[]> {
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
}

export async function fetchReviewsByCustomer(customerId: string): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching customer reviews:', error);
      return [];
    }
    
    return data as Review[];
  } catch (err) {
    console.error('Error in fetchReviewsByCustomer:', err);
    return [];
  }
}

export async function submitReview(reviewInput: Omit<Review, 'id' | 'created_at'>): Promise<Review | null> {
  try {
    const finalServiceId = (reviewInput.service_id === 'general' || !reviewInput.service_id) ? null : reviewInput.service_id;
    const finalInput = { ...reviewInput, service_id: finalServiceId };

    const { data, error } = await supabase
      .from('reviews')
      .insert(finalInput)
      .select()
      .single();

    if (error) {
      console.error('Error submitting review:', error);
      alert("Error submitting review: " + error.message);
      throw error;
    }
    
    // Update the business table's average rating and count
    if (finalInput.business_id) {
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('business_id', finalInput.business_id);
        
      if (allReviews && allReviews.length > 0) {
        const newCount = allReviews.length;
        const newRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / newCount;
        
        await supabase
          .from('businesses')
          .update({ 
            rating: parseFloat(newRating.toFixed(1)), 
            reviews_count: newCount 
          })
          .eq('id', finalInput.business_id);
      }
    }
    
    return data as Review;
  } catch (err) {
    console.error('Exception submitting review:', err);
    throw err;
  }
}

export async function deleteReview(reviewId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Error deleting review:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Exception deleting review:', err);
    return false;
  }
}
