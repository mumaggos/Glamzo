export type UserRole = 'customer' | 'business' | 'admin';

export interface UserProfile {
  glamzo_points?: number;
  affiliate_balance?: number;
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone?: string | null;
  role: UserRole;
  reputation?: number; // Reputation score (e.g., 0 - 100) or dynamic reputation level
  created_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  phone: string;
  email: string | null;
  district: string;
  city: string;
  address: string;
  door_number?: string | null;
    postal_code: string | null;
  logo_url: string | null;
  cover_url: string | null;
  whatsapp: string | null;
  instagram: string | null;
  website: string | null;
  is_verified: boolean;
  min_booking_notice?: number | null;
  cancellation_policy?: string | null;
  booking_end_margin?: number | null;
  subscription_status?: string;
  trial_ends_at?: string | null;
  credits?: number; // System credits (default 40 for PRO partner)
  is_promoted?: boolean; // Currently active marketing campaign
  promotion_ends_at?: string; // Expiration
  is_premium?: boolean; // 👑 Premium tag based on rating, bookings, etc.
  stripe_account_id?: string | null;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  selected_plan?: string | null;
  setup_completed?: boolean;
  onboarding_step?: number | null;
  public_page_enabled?: boolean;
  qr_scans_count?: number;
  setup_status?: 'pending' | 'completed' | 'self_setup';
  welcome_kit_sent?: boolean;
  terminal_sent?: boolean;
  page_views?: number;
  trial_used?: boolean;
  status?: 'setup' | 'active' | 'suspended';
    latitude?: number | null;
  longitude?: number | null;
  created_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  category?: ServiceCategory; // joined select queries lookup
}

export interface Staff {
  id: string;
  business_id: string;
  full_name: string;
  avatar_url: string | null;
  role_title: string | null;
  is_active: boolean;
  off_days?: string | null; // Comma separated weekday indices, e.g., "1,2" (Monday, Tuesday)
  email?: string | null;
  phone?: string | null;
  temp_password?: string | null;
  created_at: string;
}

export interface StaffService {
  id: string;
  staff_id: string;
  service_id: string;
}

export interface BusinessHours {
  id: string;
  business_id: string;
  weekday: number; // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface Booking {
  id: string;
  customer_id: string;
  business_id: string;
  service_id: string;
  staff_id: string | null;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  total_price: number;
  payment_method: string;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  notes: string | null;
  created_at: string;
  customer_profile?: UserProfile;
  business?: Business;
  service?: Service;
  staff?: Staff;
}

export interface AuthState {
  user: any | null; // Supabase system user
  profile: UserProfile | null; // public.profiles Custom metadata
  loading: boolean;
  error: string | null;
}

export interface Review {
  id: string;
  booking_id: string;
  business_id: string;
  customer_id: string;
  customer_name: string;
  rating: number; // 1 to 5
  comment: string;
  service_id: string;
  service_name: string;
  image_urls?: string[] | null;
  customer_stats?: { total_reviews: number; total_photos: number };
  is_reported?: boolean; // Reported by business partner
  report_reason?: string | null; // Reason why reported
  reply_text?: string | null;
  replied_at?: string | null;
  created_at: string;
}

export interface Favorite {
  id: string;
  customer_id: string;
  business_id: string;
  created_at: string;
}

export interface Dispute {
  id: string;
  booking_id: string;
  business_id: string;
  customer_id: string;
  opened_by: 'customer' | 'partner';
  reason: string;
  description: string;
  status: 'open' | 'resolved';
  admin_decision?: string;
  admin_reply?: string;
  penalization?: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  business_id: string;
  business_name: string;
  customer_id: string;
  customer_name: string;
  last_message: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender_type: 'customer' | 'business' | 'ai' | 'support' | 'system';
  sender_name: string;
  message: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  customer_id: string;
  customer_name: string;
  business_id: string | null;
  business_name: string | null;
  status: 'open' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  description: string;
  chat_history?: string;
  created_at: string;
  updated_at: string;
}

export interface GlamzoNotification {
  id: string;
  recipient_id: string;
  recipient_type: 'customer' | 'partner' | 'admin';
  title: string;
  content: string;
  channel: 'in_app' | 'email' | 'push' | 'whatsapp';
  created_at: string;
}

export interface TabletOrder {
  id: string;
  business_id: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_postal_code: string;
  shipping_city: string;
  deposit_paid: boolean;
  deposit_amount: number;
  carrier?: string | null;
  tracking_code?: string | null;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'returned';
  created_at: string;
  updated_at: string;
}


export interface SalesAgent {
  id: string;
  name: string;
  phone?: string;
  team_name?: string;
  ref_code: string;
  clicks_count: number;
  created_at: string;
}
