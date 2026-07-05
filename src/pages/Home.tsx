import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { fetchAllReviews } from "../utils/reviewsHelper";
import {
  Search, MapPin, Clock, Navigation, 
  ChevronRight, ChevronLeft, Map as MapIcon, 
  ShieldCheck, Loader2, ArrowRight, Heart, CalendarCheck, Zap, Star
} from "lucide-react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { getCoordinatesForCity, calculateDistanceInKm } from "../utils/geoData";

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || "";

const HOME_CATEGORIES = [
  { name: "Cabeleireiro", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=75", url: "/explore?category=Cabelo %26 Barbearia" },
  { name: "Barbearia", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=200&q=75", url: "/explore?category=Cabelo %26 Barbearia&subcategory=Barbearia" },
  { name: "Nails & Beauty", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=200&q=75", url: "/explore?category=Nails %26 Beauty" },
  { name: "Estética", image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=200&q=75", url: "/explore?category=Estética" },
  { name: "Wellness & Spa", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=200&q=75", url: "/explore?category=Wellness" },
  { name: "Noivas", image: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=200&q=75", url: "/explore?category=Noivas %26 Eventos" }
];

const getCustomMarkerIcon = (rating: number) => {
  const finalRating = rating > 0 ? rating : 5.0;
  return `data:image/svg+xml;utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="56" height="42" viewBox="0 0 56 42"><g filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.3))"><path d="M 8 2 L 48 2 C 51.3 2 54 4.7 54 8 L 54 22 C 54 25.3 51.3 28 48 28 L 34 28 L 28 38 L 22 28 L 8 28 C 4.7 28 2 25.3 2 22 L 2 8 C 2 4.7 4.7 2 8 2 Z" fill="#9333ea" stroke="#ffffff" stroke-width="1.5" /><text x="28" y="19" fill="#ffffff" font-size="12px" font-family="Outfit" font-weight="900" text-anchor="middle">${finalRating.toFixed(1)} ★</text></g></svg>`)}`;
};

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from("businesses").select("*").eq("status", "active");
        setBusinesses(data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const BusinessCard: React.FC<{ b: any }> = ({ b }) => (
    <Link to={`/business/${b.slug}`} className="group flex flex-col min-w-[260px] max-w-[280px] shrink-0 cursor-pointer font-['Inter']">
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden mb-3 bg-slate-100">
        <img src={b.cover_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80"} alt={b.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      </div>
      <h3 className="font-bold text-[#0f172a] font-['Outfit']">{b.name}</h3>
      <p className="text-sm text-slate-500">{b.category} · {b.city}</p>
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans flex flex-col">
      {/* 1. HERO */}
      <section className="relative pt-24 pb-20 bg-[#fafbfc]">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-7xl font-extrabold text-[#0f172a] mb-5 font-['Outfit']">O seu momento de beleza, <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-rose-500">marcado num instante.</span></h1>
          <div className="w-full max-w-4xl bg-white p-2 rounded-3xl shadow-[0_12px_40px_rgba(15,23,42,0.04)] border flex flex-col md:flex-row gap-1">
             <input type="text" placeholder="Tratamento ou Salão" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 p-4 bg-transparent outline-none text-sm" />
             <input type="text" placeholder="Localização" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} className="flex-1 p-4 bg-transparent outline-none text-sm" />
             <button onClick={() => navigate(`/explore?q=${searchQuery}&city=${searchLocation}`)} className="bg-[#0f172a] text-white px-10 py-4 rounded-2xl font-bold text-sm">Pesquisar</button>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIAS */}
      <section className="py-16 max-w-7xl mx-auto px-4 w-full">
        <h2 className="text-2xl font-bold mb-6 font-['Outfit']">O que procura hoje?</h2>
        <div className="flex overflow-x-auto gap-6 pb-4">
          {HOME_CATEGORIES.map((cat) => (
            <button key={cat.name} onClick={() => navigate(cat.url)} className="relative h-40 w-40 rounded-2xl overflow-hidden shrink-0 shadow-sm">
              <img src={cat.image} alt={cat.name} loading="lazy" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className="absolute bottom-3 left-3 text-white font-bold text-sm">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. LISTAS */}
      <div className="space-y-16 pb-16 max-w-7xl mx-auto px-4 w-full">
        <section><h2 className="text-2xl font-bold mb-6 font-['Outfit']">❤️ Recomendados</h2><div className="flex gap-6 overflow-x-auto">{businesses.slice(0, 5).map(b => <BusinessCard key={b.id} b={b} />)}</div></section>
        <section><h2 className="text-2xl font-bold mb-6 font-['Outfit']">🆕 Novas Lojas</h2><div className="flex gap-6 overflow-x-auto">{businesses.slice(5, 10).map(b => <BusinessCard key={b.id} b={b} />)}</div></section>
      </div>

      {/* 4. MAPA */}
      <section className="py-16 max-w-7xl mx-auto px-4 w-full">
        <h2 className="text-3xl font-bold mb-8 font-['Outfit']">🌍 Explorar no Mapa</h2>
        <div className="h-[500px] rounded-3xl overflow-hidden bg-slate-100 border">
          {API_KEY ? (
             <APIProvider apiKey={API_KEY}>
               <Map defaultCenter={{ lat: 39.3999, lng: -8.2245 }} defaultZoom={6} disableDefaultUI>
                 {businesses.map((b) => <Marker key={b.id} position={{ lat: b.latitude, lng: b.longitude }} icon={{ url: getCustomMarkerIcon(5), anchor: { x: 29, y: 32 } }} />)}
               </Map>
             </APIProvider>
          ) : <div className="flex items-center justify-center h-full text-slate-400">Mapa indisponível</div>}
        </div>
      </section>
    </div>
  );
}
