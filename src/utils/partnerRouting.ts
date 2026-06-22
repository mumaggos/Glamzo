import { User } from '@supabase/supabase-js';

export async function resolvePartnerRoute(user: User | null, profileRole: string | null, supabase: any): Promise<string> {
  console.log('[PartnerRoute] resolving route for user:', user?.id, 'role:', profileRole);
  if (!user) {
    console.log('[PartnerRoute] no user -> /partner/login');
    return '/partner/login';
  }
  
  if (profileRole !== 'business') {
    console.log('[PartnerRoute] role is not business -> /login');
    // We should probably log them out, but let's just send to general login for now, or block.
    return '/login';
  }

  try {
    const { data: business, error } = await supabase
      .from('businesses')
      .select('id, status')
      .eq('owner_id', user.id)
      .maybeSingle();
      
    if (error && error.code !== 'PGRST116') {
      console.error('[PartnerRoute] error fetching business:', error);
      return '/setup';
    }

    if (!business) {
      console.log('[PartnerRoute] no business found -> /setup');
      return '/setup';
    }

    if (business.status !== 'active') {
      console.log('[PartnerRoute] business status is', business.status, '-> /setup');
      return '/setup';
    }

    console.log('[PartnerRoute] business is active -> /dashboard');
    return '/dashboard';
  } catch (err) {
    console.error('[PartnerRoute] Exception resolving route:', err);
    return '/setup';
  }
}
