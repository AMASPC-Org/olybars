import React, { useEffect, useRef, useState } from 'react';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { Venue } from '../../../types';
import { useOutletContext } from 'react-router-dom';
import { Loader2, Navigation, MapPin, ExternalLink } from 'lucide-react';

// Triple-slash directive for Google Maps types (if not installed)
// <reference types="@types/google.maps" />

interface ContextType {
  venues: Venue[];
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyCXElh6HgU4Rl5fvhjMAXyn19ji3azWTJg"; // Fallback to Firebase key

const MapScreen = () => {
  const { venues } = useOutletContext<ContextType>();
  const { coords, error: geoError, loading: geoLoading } = useGeolocation();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const loadMaps = async () => {
      if (window.google?.maps) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=visualization`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      const defaultCenter = { lat: 47.0425, lng: -122.9007 }; // Olympia, WA
      const initialMap = new (window as any).google.maps.Map(mapRef.current!, {
        center: coords ? { lat: coords.latitude, lng: coords.longitude } : defaultCenter,
        zoom: 14,
        styles: darkMapStyle,
        disableDefaultUI: true,
        zoomControl: true,
      });
      setMap(initialMap);
    };

    loadMaps();
  }, []);

  useEffect(() => {
    if (!map || !venues) return;

    // Clear existing markers (In a real app, track them in a ref)
    venues.forEach(venue => {
      const isBuzzing = venue.status === 'buzzing';
      const marker = new (window as any).google.maps.Marker({
        position: { lat: venue.location.lat, lng: venue.location.lng },
        map: map,
        title: venue.name,
        icon: {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: isBuzzing ? 10 : 7,
          fillColor: isBuzzing ? "#fbbf24" : "#94a3b8",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        },
      });

      marker.addListener('click', () => {
        setSelectedVenue(venue);
        map.panTo(marker.getPosition()!);
      });
    });

    if (coords) {
      new (window as any).google.maps.Marker({
        position: { lat: coords.latitude, lng: coords.longitude },
        map: map,
        title: "You Are Here",
        icon: {
          path: (window as any).google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        },
      });
    }
  }, [map, venues, coords]);

  const handleGetDirections = (venue: Venue) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${venue.location.lat},${venue.location.lng}`, '_blank');
  };

  return (
    <div className="h-full relative bg-slate-900">
      <div ref={mapRef} className="w-full h-full" />

      {geoLoading && !coords && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-20">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-white font-league text-xl uppercase tracking-widest">Pinpointing Vibe Coordinates...</p>
        </div>
      )}

      {selectedVenue && (
        <div className="absolute bottom-24 left-4 right-4 bg-surface/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl z-30 animate-in slide-in-from-bottom-5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-black text-primary font-league uppercase tracking-wide">{selectedVenue.name}</h3>
              <p className="text-sm text-slate-400 font-body">{selectedVenue.vibe}</p>
            </div>
            <button onClick={() => setSelectedVenue(null)} className="text-slate-500 hover:text-white">
              <Loader2 className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleGetDirections(selectedVenue)}
              className="flex-1 bg-primary text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors uppercase text-sm font-league"
            >
              <Navigation className="w-4 h-4 fill-current" />
              Get Directions
            </button>
            <button className="px-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors">
              <ExternalLink className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {geoError && (
        <div className="absolute top-4 left-4 right-4 bg-red-500/90 text-white p-3 rounded-xl flex items-center gap-3 z-30 shadow-lg backdrop-blur-md">
          <MapPin className="w-5 h-5 shrink-0" />
          <p className="text-sm font-bold font-body">Location access denied. Map precision may be limited.</p>
        </div>
      )}
    </div>
  );
};

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#fbbf24" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1e293b" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#475569" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#020617" }] },
];

export default MapScreen;
