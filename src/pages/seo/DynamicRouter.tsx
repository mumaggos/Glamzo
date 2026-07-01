import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import BusinessDetail from '../BusinessDetail';
import Explore from '../Explore';
import InspirationFeed from '../inspiration/InspirationFeed';

export default function DynamicRouter() {
  const { param1, param2 } = useParams<{ param1?: string; param2?: string }>();
  const [routeType, setRouteType] = useState<'business' | 'city' | 'category' | 'style' | 'unknown' | 'loading'>('loading');
  const navigate = useNavigate();

  useEffect(() => {
    async function determineRoute() {
      if (!param1) return setRouteType('unknown');

      // Check if it's a known top-level entity (cities, categories, styles)
      const p1 = param1.toLowerCase();
      
      // Known categories
      const categories = ['barbearias', 'cabeleireiros', 'unhas', 'spa', 'massagens', 'estetica', 'clinica'];
      if (categories.includes(p1)) {
        return setRouteType('category');
      }

      // Check if it's a known city from the DB (simplification: we could query distinct cities)
      const { data: cityData } = await supabase
        .from('businesses')
        .select('city')
        .ilike('city', p1)
        .limit(1);
        
      if (cityData && cityData.length > 0) {
        return setRouteType('city');
      }

      // Check if it's an inspiration tag/style
      const { data: tagData } = await supabase
        .from('inspiration_posts')
        .select('id')
        .contains('tags', [p1])
        .limit(1);
        
      if (tagData && tagData.length > 0) {
        return setRouteType('style');
      }

      // Fallback to Business Profile
      const { data: bizData } = await supabase
        .from('businesses')
        .select('id')
        .eq('slug', param1)
        .limit(1);

      if (bizData && bizData.length > 0) {
        return setRouteType('business');
      }

      // If nothing matches, redirect home
      setRouteType('unknown');
    }

    determineRoute();
  }, [param1, param2]);

  if (routeType === 'loading') {
    return (
      <div className="flex-1 w-full min-h-[45vh] flex items-center justify-center p-6 text-slate-600">
        <div className="w-5 h-5 border-2 border-purple-500/25 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (routeType === 'unknown') {
    // Or render a 404
    navigate('/', { replace: true });
    return null;
  }

  if (routeType === 'business') {
    return <BusinessDetail overrideSlug={param1} />;
  }

  if (routeType === 'style') {
    // Render Inspiration feed for that tag
    // We can inject the param1 as tag via props, but useParams will also pick it up if we change routes.
    // However, InspirationFeed reads `tag` from useParams, so we need to pass it explicitly if we bypass standard routing.
    // Actually, let's just render Explore for everything, but Explore doesn't handle tags out of the box yet.
    // Let's modify InspirationFeed to accept a tag prop.
    return <InspirationFeed overrideTag={param1} />;
  }

  if (routeType === 'city' || routeType === 'category') {
    // param1 = porto, param2 = barbearias OR param1 = barbearias, param2 = porto
    // Explore reads URL params to auto-filter.
    return <Explore autoFilter={{ city: routeType === 'city' ? param1 : param2, category: routeType === 'category' ? param1 : param2 }} />;
  }

  return null;
}
