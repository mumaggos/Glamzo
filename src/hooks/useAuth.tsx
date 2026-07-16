import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (fullName: string | null, avatarUrl: string | null, phone?: string | null, email?: string | null) => Promise<any>;
  refreshProfile: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch standard user profile strictly from Supabase
  const fetchProfile = async (userId: string, currentUserEmail: string): Promise<UserProfile | null> => {
    if (!isSupabaseConfigured) return null;

    const emailSafe = currentUserEmail || '';
    const nameFallback = emailSafe ? emailSafe.split('@')[0] : 'Utilizador';

    try {
      // 1. Fetch profile from database
      const { data, error: fetchErr } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, phone, role, created_at, glamzo_points, affiliate_balance')
        .eq('id', userId)
        .single();

      let currentProfile = data as UserProfile | null;

      // Force-sync DB profile role if they registered locally with a custom role but DB was defaulted by trigger
      let storedRole = localStorage.getItem(`local_role_${userId}`) as UserRole | null;
      const pendingRole = localStorage.getItem('pending_signup_role') as UserRole | null;
      if (pendingRole) {
        storedRole = pendingRole;
        localStorage.setItem(`local_role_${userId}`, pendingRole);
        localStorage.removeItem('pending_signup_role');
      }

      if (currentProfile && storedRole && currentProfile.role !== storedRole) {
        if (currentProfile.role === 'customer' && (storedRole === 'business' || storedRole === 'admin')) {
          try {
            await supabase.from('profiles').update({ role: storedRole }).eq('id', userId);
            currentProfile.role = storedRole;
          } catch (roleSyncErr) {
            console.warn('Silent role sync mismatch correction bypassed:', roleSyncErr);
          }
        } else {
          // Keep database role and update localStorage to match the database truth!
          localStorage.setItem(`local_role_${userId}`, currentProfile.role);
        }
      }

      
      // Business Ownership Check
      // Se o utilizador tem o role 'customer', vamos verificar se tem um business_id associado.
      if (currentProfile && currentProfile.role === 'customer') {
        try {
          const { data: businessCheck } = await supabase
            .from('businesses')
            .select('id')
            .eq('owner_id', userId)
            .maybeSingle();
            
          if (businessCheck) {
            console.log("Found business for user, automatically promoting to business role.");
            currentProfile.role = 'business';
            await supabase.from('profiles').update({ role: 'business' }).eq('id', userId);
            localStorage.setItem(`local_role_${userId}`, 'business');
          }
        } catch(e) {
          console.error("Error checking business ownership:", e);
        }
      }

      // 2. Special hardcoded admin validation for admin account
      // email: admin@gmail.com, password: 191191 (Should have admin role)
      if (emailSafe === 'admin@gmail.com' || emailSafe === 'glamzo.suporte@gmail.com') {
        if (!currentProfile || currentProfile.role !== 'admin') {
          // Guard and force write/upsert of admin profile in the profiles table
          const adminProfilePayload = {
            id: userId,
            email: emailSafe,
            full_name: currentProfile?.full_name || (emailSafe === 'glamzo.suporte@gmail.com' ? 'Suporte Glamzo' : 'Administrador Geral'),
            role: 'admin' as UserRole,
            avatar_url: currentProfile?.avatar_url || null,
            created_at: new Date().toISOString()
          };

          const { data: upsertData, error: upsertErr } = await supabase
            .from('profiles')
            .upsert(adminProfilePayload)
            .select()
            .single();

          if (!upsertErr && upsertData) {
            currentProfile = upsertData as UserProfile;
          }
        }
      }

      // 3. Fallback to automatic insert if profile doesn't exist for a regular user
      if (!currentProfile) {
        // Query user metadata to check for explicit signup role definition
        let metadataRole: UserRole | null = null;
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && session.user.id === userId) {
            metadataRole = session.user.user_metadata?.role as UserRole | null;
          }
        } catch (_) {}

        const storedRole = localStorage.getItem(`local_role_${userId}`) as UserRole | null;
        let defaultRole: UserRole = storedRole || metadataRole || 'customer';
        
        if (!storedRole && !metadataRole) {
          if (emailSafe === 'admin@gmail.com' || emailSafe === 'glamzo.suporte@gmail.com') {
            defaultRole = 'admin';
          }
        }

        const fallbackPayload = {
          id: userId,
          email: emailSafe,
          full_name: nameFallback,
          role: defaultRole,
          avatar_url: null,
          created_at: new Date().toISOString()
        };

        const { data: insertData, error: insertErr } = await supabase
          .from('profiles')
          .insert(fallbackPayload)
          .select()
          .single();

        if (!insertErr && insertData) {
          currentProfile = insertData as UserProfile;
        } else {
          // Select retry as fall-behind query
          const { data: retryData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          if (retryData) {
            currentProfile = retryData as UserProfile;
          }
        }
      }

      // We removed locally syncing profile.role. Rely completely on DB and Metadata.
      if (!currentProfile) {
        // Ultimate fallback to prevent the app from getting stuck on loading
        console.warn('Could not fetch or create profile in DB, using a local in-memory profile definition.');
        let metadataRole: UserRole | null = null;
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && session.user.id === userId) {
            metadataRole = session.user.user_metadata?.role as UserRole | null;
          }
        } catch (_) {}

        let defaultRole: UserRole = metadataRole || 'customer';
        if (!metadataRole) {
          if (emailSafe === 'admin@gmail.com' || emailSafe === 'glamzo.suporte@gmail.com') {
            defaultRole = 'admin';
          }
        }

        currentProfile = {
          id: userId,
          email: emailSafe,
          full_name: nameFallback,
          role: defaultRole,
          avatar_url: null,
          created_at: new Date().toISOString()
        };
      }

      return currentProfile;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      
      // Fallback on exception to let the user in safely
      let metadataRole: UserRole | null = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && session.user.id === userId) {
          metadataRole = session.user.user_metadata?.role as UserRole | null;
        }
      } catch (_) {}

      let defaultRole: UserRole = metadataRole || 'customer';
      if (!metadataRole) {
        if (emailSafe === 'admin@gmail.com' || emailSafe === 'glamzo.suporte@gmail.com') {
          defaultRole = 'admin';
        }
      }

      return {
        id: userId,
        email: emailSafe,
        full_name: nameFallback,
        role: defaultRole,
        avatar_url: null,
        created_at: new Date().toISOString()
      };
    }
  };

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const activeUser = session?.user || user;
    if (activeUser) {
      const p = await fetchProfile(activeUser.id, activeUser.email);
      setProfile(p);
      if (!user) {
        setUser(activeUser);
      }
      return p;
    }
    return null;
  };

  // Listen to Auth sessions and state changes from Supabase Auth
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;
    let fallbackTimeout: any = null;
    let lastUserId: string | null = null;
    setLoading(true);

    // Safeguard automatic timeout protection (8s max) to prevent user from being stuck indefinitely
    fallbackTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn("Auth initialization transition safeguard triggered.");
        setLoading(false);
      }
    }, 8000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        lastUserId = session.user.id;
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email || '').then((prof) => {
          if (mounted) {
            setProfile(prof);
            if (fallbackTimeout) clearTimeout(fallbackTimeout);
            setLoading(false);
          }
        }).catch((err) => {
          console.error("fetchProfile exception during getSession fetch:", err);
          if (mounted) {
            if (fallbackTimeout) clearTimeout(fallbackTimeout);
            setLoading(false);
          }
        });
      } else {
        setUser(null);
        setProfile(null);
        if (fallbackTimeout) clearTimeout(fallbackTimeout);
        setLoading(false);
      }
    }).catch((sessionErr) => {
      console.error("supabase auth getSession exception:", sessionErr);
      if (mounted) {
        if (fallbackTimeout) clearTimeout(fallbackTimeout);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        // Prevent duplicate authentication fetch loops for the exact same active user profile
        if (session.user.id === lastUserId) {
          setUser(session.user);
          return;
        }
        
        lastUserId = session.user.id;
        setLoading(true);
        setUser(session.user);
        try {
          const p = await fetchProfile(session.user.id, session.user.email || '');
          if (mounted) {
            setProfile(p);
            if (fallbackTimeout) clearTimeout(fallbackTimeout);
            setLoading(false);
          }
        } catch (onAuthErr) {
          console.error("fetchProfile inside onAuthStateChange exception:", onAuthErr);
          if (mounted) {
            if (fallbackTimeout) clearTimeout(fallbackTimeout);
            setLoading(false);
          }
        }
      } else {
        lastUserId = null;
        setUser(null);
        setProfile(null);
        if (fallbackTimeout) clearTimeout(fallbackTimeout);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      subscription.unsubscribe();
    };
  }, []);


  // Realtime Profile Updates
  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;
    
    const channel = supabase.channel(`public:profiles:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          if (payload.new) {
            setProfile((prev) => prev ? { ...prev, ...payload.new } : payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Real SQL Auth signup
  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    setError(null);
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet.');
    }

    // Fix race condition by anticipating the role in case of fast triggers
    localStorage.setItem('pending_signup_role', role);

    const { data, error: suError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (suError) {
      setError(suError.message);
      throw suError;
    }

    // Direct write to custom profiles table to ensure role config matches choice
    if (data?.user) {
      localStorage.setItem(`local_role_${data.user.id}`, role);
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          role: role,
          created_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Manual profiles DB entry creation bypassed or handled by trigger.', e);
      }
    }

    return data;
  };

  // Real SQL Auth signin
  const signIn = async (email: string, password: string) => {
    setError(null);
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet.');
    }

    const { data, error: siError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (siError) {
      setError(siError.message);
      throw siError;
    }

    return data;
  };

  // Real Auth Google Sign In
  const signInWithGoogle = async () => {
    setError(null);
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet.');
    }

    const { data, error: gError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (gError) {
      setError(gError.message);
      throw gError;
    }

    return data;
  };

  // Real Auth SignOut
  const signOut = async () => {
    setError(null);
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Signout server request warning:', e);
      }
    }
    setUser(null);
    setProfile(null);
  };

  // Real Password reset callback
  const resetPassword = async (email: string) => {
    setError(null);
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured yet.');
    }

    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (resetErr) {
      setError(resetErr.message);
      throw resetErr;
    }
  };

  // Update profile in SQL
  const updateProfile = async (fullName: string | null, avatarUrl: string | null, phone?: string | null, email?: string | null) => {
    setError(null);
    if (!user) throw new Error('Not authenticated');
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured');

    const updatePayload: any = {};
    if (fullName !== undefined) updatePayload.full_name = fullName;
    if (avatarUrl !== undefined) updatePayload.avatar_url = avatarUrl;
    if (phone !== undefined) updatePayload.phone = phone;
    if (email !== undefined) updatePayload.email = email;

    const { data, error: upErr } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id)
      .select()
      .single();

    if (upErr) {
      setError(upErr.message);
      throw upErr;
    }

    setProfile(data as UserProfile);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
