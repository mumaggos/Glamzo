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

export async function fetchReviewsForBusiness(businessId: string): Promise<Review[]> {
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
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewInput)
      .select()
      .single();

    if (error) {
      console.error('Error submitting review:', error);
      throw error;
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
