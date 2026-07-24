import { User } from '@supabase/supabase-js';
import { useTranslation } from "react-i18next";

export async function resolvePartnerRoute(user: User | null, profileRole: string | null, supabase: any): Promise<string> {
  if (!user) {
    return '/partner/login';
  }
  
  if (profileRole !== 'business') {
    return '/login';
  }

  try {
    const { data: business, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('[PartnerRoute] Erro ao buscar business:', error);
      return '/partner/setup';
    }

    if (!business) {
      return '/partner/setup';
    }

    const isBusinessActive = business.status === 'active';
    const isSetupCompleted = business.setup_completed === true;
    
    if (!isBusinessActive || !isSetupCompleted) {
      return '/partner/setup';
    }

    return '/partner/dashboard';
  } catch (err) {
    console.error('[PartnerRoute] Exceção:', err);
    return '/partner/setup';
  }
}
