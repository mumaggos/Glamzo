import { User } from '@supabase/supabase-js';

export async function resolvePartnerRoute(user: User | null, profileRole: string | null, supabase: any): Promise<string> {
  console.log('[PartnerRoute] resolvendo rota. User:', user?.id, 'Role:', profileRole);
  
  if (!user) {
    console.log('[PartnerRoute] redirect => /partner/login (sem sessão)');
    return '/partner/login';
  }
  
  if (profileRole !== 'business') {
    console.log('[PartnerRoute] redirect => /login (role não é business)');
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
      console.log('[PartnerRoute] redirect => /partner/setup (business não encontrado)');
      return '/partner/setup';
    }

    const isBusinessActive = business.status === 'active';
    const isSetupCompleted = business.setup_completed === true;
    
    if (!isBusinessActive || !isSetupCompleted) {
      console.log(`[PartnerRoute] redirect => /partner/setup (status: ${business.status}, setup_completed: ${business.setup_completed})`);
      return '/partner/setup';
    }

    console.log('[PartnerRoute] redirect => /partner/dashboard (status active, setup completed)');
    return '/partner/dashboard';
  } catch (err) {
    console.error('[PartnerRoute] Exceção:', err);
    return '/partner/setup';
  }
}
