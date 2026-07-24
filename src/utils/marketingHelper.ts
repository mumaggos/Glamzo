import { supabase } from '../lib/supabase';
import { Dispute, Favorite, Review } from '../types';
import { useTranslation } from "react-i18next";

// Storage keys
const CREDITS_STORAGE_PFX = 'glamzo_credits_';
const PROMOTION_STORAGE_PFX = 'glamzo_promo_';
const FAVORITES_STORAGE_KEY = 'glamzo_customer_favorites';
const DISPUTES_STORAGE_KEY = 'glamzo_support_disputes';
const REPORTED_REVIEWS_KEY = 'glamzo_reported_reviews';

// --- CREDITS SYSTEM ---

export async function fetchBusinessCredits(businessId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('credits')
      .eq('id', businessId)
      .single();

    if (!error && data) {
      return Number(data.credits ?? 40);
    }
  } catch (_) {}

  // Fallback to localStorage
  const saved = localStorage.getItem(`${CREDITS_STORAGE_PFX}${businessId}`);
  if (saved !== null) {
    return parseInt(saved, 10);
  }
  // All partners have 40 initial credits as default
  localStorage.setItem(`${CREDITS_STORAGE_PFX}${businessId}`, '40');
  return 40;
}

export async function addBusinessCredits(businessId: string, amount: number): Promise<number> {
  const current = await fetchBusinessCredits(businessId);
  const updated = current + amount;

  try {
    const { error } = await supabase
      .from('businesses')
      .update({ credits: updated })
      .eq('id', businessId);

    if (error) throw error;
  } catch (_) {}

  localStorage.setItem(`${CREDITS_STORAGE_PFX}${businessId}`, String(updated));
  return updated;
}

export async function promoteBusiness(businessId: string, hours: number): Promise<{ success: boolean; currentCredits: number; error?: string }> {
  const current = await fetchBusinessCredits(businessId);
  if (current < hours) {
    return { success: false, currentCredits: current, error: 'Créditos insuficientes para esta duração de promoção.' };
  }

  const newCredits = current - hours;
  // Calculate promotion end time (current time + hours)
  const endsAt = new Date(Date.now() + hours * 3600 * 1000).toISOString();

  try {
    const { error } = await supabase
      .from('businesses')
      .update({ 
        credits: newCredits,
        is_promoted: true,
        promotion_ends_at: endsAt
      })
      .eq('id', businessId);

    if (error) throw error;
  } catch (_) {}

  localStorage.setItem(`${CREDITS_STORAGE_PFX}${businessId}`, String(newCredits));
  localStorage.setItem(`${PROMOTION_STORAGE_PFX}${businessId}`, JSON.stringify({
    is_promoted: true,
    promotion_ends_at: endsAt
  }));

  return { success: true, currentCredits: newCredits };
}

export async function getPromotionStatus(businessId: string): Promise<{ is_promoted: boolean; promotion_ends_at: string | null }> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('is_promoted, promotion_ends_at')
      .eq('id', businessId)
      .single();

    if (!error && data) {
      const isPromoted = !!data.is_promoted;
      const endsAt = data.promotion_ends_at;
      
      // If promotion expired in database, clean it up
      if (isPromoted && endsAt && new Date(endsAt).getTime() < Date.now()) {
        await supabase.from('businesses').update({ is_promoted: false, promotion_ends_at: null }).eq('id', businessId);
        return { is_promoted: false, promotion_ends_at: null };
      }
      return { is_promoted: isPromoted, promotion_ends_at: endsAt };
    }
  } catch (_) {}

  // Fallback to localStorage
  const promoStr = localStorage.getItem(`${PROMOTION_STORAGE_PFX}${businessId}`);
  if (promoStr) {
    const details = JSON.parse(promoStr);
    const endsAt = details.promotion_ends_at;
    if (endsAt && new Date(endsAt).getTime() < Date.now()) {
      localStorage.removeItem(`${PROMOTION_STORAGE_PFX}${businessId}`);
      return { is_promoted: false, promotion_ends_at: null };
    }
    return { is_promoted: !!details.is_promoted, promotion_ends_at: endsAt };
  }

  return { is_promoted: false, promotion_ends_at: null };
}

// --- FAVORITES SYSTEM ---

export async function toggleFavorite(customerId: string, businessId: string): Promise<boolean> {
  const favorites = await fetchCustomerFavorites(customerId);
  const index = favorites.indexOf(businessId);
  const isNowFav = index === -1;

  if (isNowFav) {
    favorites.push(businessId);
    try {
      await supabase.from('favorites').insert({ customer_id: customerId, business_id: businessId });
    } catch (_) {}
  } else {
    favorites.splice(index, 1);
    try {
      await supabase.from('favorites').delete().eq('customer_id', customerId).eq('business_id', businessId);
    } catch (_) {}
  }

  localStorage.setItem(`${FAVORITES_STORAGE_KEY}_${customerId}`, JSON.stringify(favorites));
  return isNowFav;
}

export async function fetchCustomerFavorites(customerId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('business_id')
      .eq('customer_id', customerId);

    if (!error && data) {
      return data.map((f: any) => f.business_id);
    }
  } catch (_) {}

  const saved = localStorage.getItem(`${FAVORITES_STORAGE_KEY}_${customerId}`);
  return saved ? JSON.parse(saved) : [];
}

export async function isFavorite(customerId: string, businessId: string): Promise<boolean> {
  const favorites = await fetchCustomerFavorites(customerId);
  return favorites.includes(businessId);
}

// --- REPUTATION SYSTEM ---

export async function fetchCustomerReputation(customerId: string): Promise<{ 
  score: number; 
  level: string; 
  completedCount: number; 
  reviewCount: number; 
  noShowCount: number;
}> {
  let completedCount = 4; // defaults to look mature
  let reviewCount = 2;
  let noShowCount = 0;

  try {
    // 1. Fetch real bookings
    const { data: bList } = await supabase
      .from('bookings')
      .select('booking_status')
      .eq('customer_id', customerId);

    if (bList && bList.length > 0) {
      completedCount = bList.filter(b => b.booking_status === 'completed').length;
      noShowCount = bList.filter(b => b.booking_status === 'no_show').length;
    }

    // 2. Fetch real reviews
    const { data: rList } = await supabase
      .from('reviews')
      .select('id')
      .eq('customer_id', customerId);
      
    if (rList) {
      reviewCount = rList.length;
    }
  } catch (_) {}

  // Calculate customized reputation formula
  // Perfect starter = 100. Each completed booking adds reputation points (+5 points). Positive review adds reputation (+10 points). Each noShow decreases reputation drastically (-30 points).
  let score = 100 + (completedCount * 5) + (reviewCount * 10) - (noShowCount * 30);
  score = Math.max(10, Math.min(200, score)); // between 10 and 200

  let level = 'Cliente Comum';
  if (score >= 150) level = '👑 Colecionador Estelar';
  else if (score >= 120) level = '✨ Elite Verified';
  else if (score >= 90) level = 'Cliente Recomendado';
  else if (score < 50) level = '⚠️ Sob Observação';

  return {
    score,
    level,
    completedCount,
    reviewCount,
    noShowCount
  };
}

// --- DISPUTES ENGINE ---

export async function createDispute(disputeInput: Omit<Dispute, 'id' | 'created_at' | 'status'>): Promise<Dispute> {
  const newDispute: Dispute = {
    ...disputeInput,
    id: crypto.randomUUID(),
    status: 'open',
    created_at: new Date().toISOString()
  };

  try {
    await supabase.from('disputes').insert(newDispute);
  } catch (_) {}

  const curr = await fetchDisputes();
  curr.push(newDispute);
  localStorage.setItem(DISPUTES_STORAGE_KEY, JSON.stringify(curr));

  return newDispute;
}

export async function fetchDisputes(): Promise<Dispute[]> {
  try {
    const { data, error } = await supabase
      .from('disputes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data as Dispute[];
    }
  } catch (_) {}

  const saved = localStorage.getItem(DISPUTES_STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

export async function updateDisputeStatus(
  disputeId: string, 
  decision: string, 
  reply: string, 
  penalization?: string
): Promise<Dispute | null> {
  try {
    const { data, error } = await supabase
      .from('disputes')
      .update({
        status: 'resolved',
        admin_decision: decision,
        admin_reply: reply,
        penalization: penalization || null
      })
      .eq('id', disputeId)
      .select()
      .single();

    if (!error && data) {
      return data as Dispute;
    }
  } catch (_) {}

  const curr = await fetchDisputes();
  const match = curr.find(d => d.id === disputeId);
  if (match) {
    match.status = 'resolved';
    match.admin_decision = decision;
    match.admin_reply = reply;
    match.penalization = penalization || undefined;
    localStorage.setItem(DISPUTES_STORAGE_KEY, JSON.stringify(curr));
    return match;
  }
  return null;
}

// --- REVIEWS SYSTEM REPORTS ---

export async function reportReview(reviewId: string, reason: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reviews')
      .update({
        is_reported: true,
        report_reason: reason
      })
      .eq('id', reviewId);

    if (error) throw error;
  } catch (_) {}

  try {
    const reportedList = JSON.parse(localStorage.getItem(REPORTED_REVIEWS_KEY) || '{}');
    reportedList[reviewId] = { is_reported: true, reason };
    localStorage.setItem(REPORTED_REVIEWS_KEY, JSON.stringify(reportedList));
  } catch (_) {}

  return true;
}

export function getLocalReportedReviews(): Record<string, { is_reported: boolean; reason: string }> {
  try {
    return JSON.parse(localStorage.getItem(REPORTED_REVIEWS_KEY) || '{}');
  } catch (_) {
    return {};
  }
}
