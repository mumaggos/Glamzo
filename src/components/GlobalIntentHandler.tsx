import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export function GlobalIntentHandler() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile) {
      const handleIntent = async () => {
        let hasIntent = false;
        
        // Check for pending favorite shop
        const pendingShopId = localStorage.getItem('pendingFavoriteShopId');
        if (pendingShopId) {
          hasIntent = true;
          try {
            await supabase.from('favorites').insert({
              customer_id: user.id,
              business_id: pendingShopId
            });
          } catch (err) {
            console.error('Failed to save pending favorite:', err);
          }
          localStorage.removeItem('pendingFavoriteShopId');
        }

        // Check for redirect intent
        const returnTo = localStorage.getItem('returnTo');
        if (returnTo) {
          hasIntent = true;
          localStorage.removeItem('returnTo');
          navigate(returnTo, { replace: true });
        }
      };

      handleIntent();
    }
  }, [user, profile, loading, navigate]);

  return null;
}
