import React, { Suspense, lazy, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, CalendarCheck, Star, ShieldCheck, Loader2 } from "lucide-react";
import { Image } from "./Image";
import { LocalizedLink } from "./LocalizedLink";

import { lazyWithRetry } from "../utils/lazyImport";
const HomeMap = lazyWithRetry(() => import("./HomeMap"));

export const HomeBelowFold = React.memo(function HomeBelowFold({
  HOME_CATEGORIES,
  loading,
  locaisProximos,
  recomendados,
  novasLojas,
  BusinessCard,
  userCoords,
  mapBusinesses,
  currentLangCode
}: any) {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const mapRef = useRef<HTMLDivElement>(null);
  const [loadMap, setLoadMap] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);


  const scrollCategories = (direction: 'left' | 'right') => {
    const container = document.getElementById('categories-container');
    if (container) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* 2. NAVEGAÇÃO POR CATEGORIA VISUAL */}
      <section className="py-12 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative group">
          <button onClick={() => scrollCategories('left')} aria-label="Ver categorias anteriores" className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div id="categories-container" className="flex overflow-x-auto gap-6 pb-4 no-scrollbar snap-x scroll-smooth">
            {HOME_CATEGORIES.map((cat: any, index: number) => (
              <button 
                key={cat.name} 
                onClick={() => navigate(cat.url)} 
                className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-2xl overflow-hidden group shrink-0 snap-start shadow-sm hover:shadow-xl transition-all"
              >
                <Image src={cat.image} priority={index < 4} alt="" fill sizes="(max-width: 640px) 160px, 160px" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                <span className="absolute bottom-3 left-3 right-3 text-left text-sm font-bold text-white leading-tight drop-shadow-md font-['Outfit']">
                  {t(`categories.${cat.name}`, { defaultValue: cat.name })}
                </span>
              </button>
            ))}
          </div>
          <button onClick={() => scrollCategories('right')} aria-label="Ver próximas categorias" className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* 3. CONTEÚDO DINÂMICO */}
      <div className="space-y-16 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : (
          <>
            {locaisProximos.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-display font-extrabold text-[#0f172a] font-['Outfit']">{t('home.nearYou')}</h2>
                  <p className="text-sm text-slate-500 mt-1 font-['Inter']">{t('home.nearYouSubtitle')}</p>
                </div>
                <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar snap-x">
                  {locaisProximos.map((b: any) => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}
                </div>
              </section>
            )}

            {recomendados.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-display font-extrabold text-[#0f172a] font-['Outfit']">{t('home.recommendedForYou')}</h2>
                  <p className="text-sm text-slate-500 mt-1 font-['Inter']">{t('home.recommendedForYouSubtitle')}</p>
                </div>
                <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar snap-x">
                  {recomendados.map((b: any) => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}
                </div>
              </section>
            )}

            {novasLojas.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-display font-extrabold text-[#0f172a] font-['Outfit']">{t('home.justArrived')}</h2>
                  <p className="text-sm text-slate-500 mt-1 font-['Inter']">{t('home.justArrivedSubtitle')}</p>
                </div>
                <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar snap-x">
                  {novasLojas.map((b: any) => <div key={b.id} className="snap-start"><BusinessCard b={b} /></div>)}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* 4. PROPOSTA DE VALOR REAIS */}
      <section className="py-16 sm:py-24 bg-purple-50/40 border-y border-purple-100 font-['Inter']">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#0f172a] mb-4 font-['Outfit']">{t('home.whyBookWithGlamzo')}</h2>
            <p className="text-slate-600 text-base">{t('home.whyBookWithGlamzoSubtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-white text-purple-600 shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center mb-6">
                <CalendarCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-3 font-['Outfit']">{t('home.feature1Title')}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{t('home.feature1Desc')}</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-white text-rose-500 shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center mb-6">
                <Star className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-3 font-['Outfit']">{t('home.feature2Title')}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{t('home.feature2Desc')}</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-white text-emerald-500 shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-3 font-['Outfit']">{t('home.feature3Title')}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{t('home.feature3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MAPA INTELIGENTE GEOGRÁFICO */}
      <section ref={mapRef} className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full font-['Inter']">
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-display font-extrabold text-[#0f172a] font-['Outfit']">{t('home.exploreOnMap')}</h2>
            <p className="text-slate-500 mt-2">{t('home.exploreOnMapSubtitle')}</p>
          </div>
          <button onClick={() => navigate('/explore?view=map')} className="text-sm font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-5 py-2.5 rounded-xl transition-colors">
            {t('home.viewFullMap')}
          </button>
        </div>

        <Suspense fallback={<div className="h-[450px] sm:h-[500px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm bg-slate-100 flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /></div>}>
          {loadMap ? <HomeMap userCoords={userCoords} mapBusinesses={mapBusinesses} currentLangCode={currentLangCode} /> : <div className="h-[450px] sm:h-[500px] rounded-3xl bg-slate-100 animate-pulse" />}
        </Suspense>
      </section>
    </>
  );
});

export default HomeBelowFold;
