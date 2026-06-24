import React, { useEffect, useState } from 'react';
import ContentLayout from './ContentLayout';
import { supabase } from '../lib/supabase';

interface DynamicLegalPageProps {
  slug: string;
  defaultTitle: string;
  defaultContent: React.ReactNode;
  defaultLastUpdated?: string;
}

export default function DynamicLegalPage({ 
  slug, 
  defaultTitle, 
  defaultContent, 
  defaultLastUpdated 
}: DynamicLegalPageProps) {
  const [pageData, setPageData] = useState<{ title: string; content: string; updated_at: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPage() {
      try {
        const { data, error } = await supabase
          .from('platform_pages')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (data && !error) {
          setPageData(data);
        }
      } catch (err) {
        console.error("Falha ao carregar página dinâmica:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <ContentLayout title={defaultTitle} lastUpdated={defaultLastUpdated}>
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mt-4"></div>
        </div>
      </ContentLayout>
    );
  }

  if (pageData) {
    return (
      <ContentLayout 
        title={pageData.title} 
        lastUpdated={new Date(pageData.updated_at).toLocaleDateString('pt-PT')}
      >
        <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title={defaultTitle} lastUpdated={defaultLastUpdated}>
      {defaultContent}
    </ContentLayout>
  );
}
