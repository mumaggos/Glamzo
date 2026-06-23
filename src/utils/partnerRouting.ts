import { User } from '@supabase/supabase-js';

export async function resolvePartnerRoute(user: User | null, profileRole: string | null, supabase: any): Promise<string> {
  console.log('[PartnerRoute] resolvendo rota. User:', user?.id, 'Role:', profileRole);
  
  // Caso 1: sem sessão
  if (!user) {
    console.log('[PartnerRoute] redirect => /partner/login (sem sessão)');
    return '/partner/login';
  }
  
  // Caso 2: sessão existe mas profile não é business
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
      // Fallback seguro em caso de erro (sem ser o not found)
      return '/setup';
    }

    // Caso 3: não existe business associado
    if (!business) {
      console.log('[PartnerRoute] redirect => /setup (business não encontrado)');
      return '/setup';
    }

    // Caso 4 & 6: business existe mas não está active
    let isBusinessActive = business.status === 'active';
    
    if (!isBusinessActive) {
      console.log(`[PartnerRoute] redirect => /setup (status é ${business.status})`);
      return '/setup';
    }

    // Caso 5: business active
    console.log('[PartnerRoute] redirect => /dashboard (status active)');
    return '/dashboard';
  } catch (err) {
    console.error('[PartnerRoute] Exceção:', err);
    return '/setup';
  }
}
