import React, { useEffect } from 'react';
import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';
import { Map as MapIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const API_KEY = (import.meta as any).env.VITE_GOOGLE_MAPS_PLATFORM_KEY || "";

const mapStyles = [
  { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "labels", stylers: [{ visibility: "on" }] }
];

// O Novo Marcador Oficial em Gota (Estilo Uber / Glamzo #9333ea)
const getCustomMarkerIcon = (rating: number) => {
  const finalRating = rating > 0 ? rating : 5.0;
  const ratingText = `${finalRating.toFixed(1)}`;
  const bgColor = "#9333ea"; 
  const textColor = "#ffffff";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
      <g filter="drop-shadow(0px 4px 4px rgba(0,0,0,0.25))">
        <path d="M20 0C8.954 0 0 8.954 0 20c0 15 20 30 20 30s20-15 20-30C40 8.954 31.046 0 20 0z" fill="${bgColor}" stroke="#ffffff" stroke-width="1.5"/>
        <text x="20" y="21" fill="${textColor}" font-size="12px" font-family="Outfit, system-ui, sans-serif" font-weight="900" text-anchor="middle">
          ${ratingText}
        </text>
        <text x="20" y="28" fill="${textColor}" font-size="7px" font-family="Outfit, system-ui, sans-serif" font-weight="bold" text-anchor="middle">
          ★
        </text>
      </g>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
};

const MapUpdater = ({ coordinates }: { coordinates: { lat: number; lng: number } | null }) => {
  const map = useMap();
  useEffect(() => {
    if (map && coordinates) {
      map.panTo(coordinates);
    }
  }, [map, coordinates]);
  return null;
};

interface HomeMapProps {
  userCoords: { lat: number; lng: number } | null;
  mapBusinesses: any[];
  currentLangCode: string;
}

export default function HomeMap({ userCoords, mapBusinesses, currentLangCode }: HomeMapProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!API_KEY) {
    return (
      <div className="h-[450px] sm:h-[500px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm relative bg-slate-50 flex flex-col items-center justify-center text-slate-400 font-medium p-4 text-center">
        <MapIcon className="w-10 h-10 mb-2 text-slate-300 animate-pulse" /> 
        <span className="text-sm font-bold text-slate-700">{t('home.mapStores', { defaultValue: 'Explore os espaços no mapa' })}</span> 
      </div>
    );
  }

  return (
    <div className="h-[450px] sm:h-[500px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm relative bg-slate-100">
      <APIProvider apiKey={API_KEY} language={currentLangCode}>
        <MapUpdater coordinates={userCoords} />
        <Map
          defaultCenter={userCoords ? { lat: userCoords.lat, lng: userCoords.lng } : { lat: 38.7223, lng: -9.1393 }}
          defaultZoom={userCoords ? 13 : 8}
          disableDefaultUI
          clickableIcons={false}
          styles={mapStyles}
          options={{ clickableIcons: false, styles: mapStyles }}
          style={{ width: '100%', height: '100%' }}
        >
          {userCoords && <Marker position={{ lat: userCoords.lat, lng: userCoords.lng }} icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png" />}
          {mapBusinesses.map((b: any) => (
            <Marker 
              key={b.id} 
              position={{ lat: b.lat, lng: b.lng }}
              title={b.name}
              icon={{ url: getCustomMarkerIcon(b.rating || 0), anchor: { x: 20, y: 50 } }}
              onClick={() => navigate("/" + b.slug)}
            />
          ))}
        </Map>
      </APIProvider>
    </div>
  );
}
