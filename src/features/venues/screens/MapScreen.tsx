import React, { useEffect, useRef, useState } from 'react';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { Venue } from '../../../types';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Loader2, Navigation, MapPin, ExternalLink } from 'lucide-react';

// Triple-slash directive for Google Maps types (if not installed)
// <reference types="@types/google.maps" />

interface ContextType {
  venues: Venue[];
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const MapScreen = () => {
  const navigate = useNavigate();
  const { venues } = useOutletContext<ContextType>();
  const { coords, error: geoError, loading: geoLoading, requestLocation, isRequested } = useGeolocation({ shouldPrompt: false });
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const timeout = setTimeout(() => {
      if (status === 'loading') setStatus('error');
    }, 10000); // 10s timeout

    const loadMaps = async () => {
      if (!GOOGLE_MAPS_API_KEY) {
        setStatus('error');
        return;
      }
      if ((window as any).google?.maps) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=visualization`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        clearTimeout(timeout);
        initMap();
      };
      script.onerror = () => {
        clearTimeout(timeout);
        setStatus('error');
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      try {
        const defaultCenter = { lat: 47.0425, lng: -122.9007 }; // Olympia, WA
        const initialMap = new (window as any).google.maps.Map(mapRef.current!, {
          center: coords ? { lat: coords.latitude, lng: coords.longitude } : defaultCenter,
          zoom: 14,
          styles: darkMapStyle,
          disableDefaultUI: true,
          zoomControl: true,
        });
        setMap(initialMap);
        setStatus('ready');
      } catch (e) {
        setStatus('error');
      }
    };

    loadMaps();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!map || !venues || status !== 'ready') return;

    // Clear existing markers (In a real app, track them in a ref)
    venues.forEach(venue => {
      if (!venue.location?.lat || !venue.location?.lng) return;
      const isBuzzing = venue.status === 'buzzing';
      const marker = new (window as any).google.maps.Marker({
        position: { lat: venue.location.lat, lng: venue.location.lng },
        map: map,
        title: venue.name,
        label: {
          text: venue.name,
          color: "#ffffff",
          fontSize: "10px",
          fontWeight: "900",
        },
        icon: {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: isBuzzing ? 12 : 9,
          fillColor: isBuzzing ? "#fbbf24" : "#94a3b8",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#0f172a",
          labelOrigin: new (window as any).google.maps.Point(0, 3)
        },
      });

      let infoWindow = new (window as any).google.maps.InfoWindow();

      marker.addListener('click', () => {
        const contentString = `
          <div style="padding: 8px; color: #0f172a;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 900;">${venue.name}</h3>
            <p style="margin: 0; font-size: 12px; color: #64748b;">${venue.status.toUpperCase()} • ${venue.vibe}</p>
            <div style="margin-top: 8px; text-align: right;">
               <button id="view-listing-${venue.id}" style="background: #0f172a; color: #fbbf24; border: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer; text-transform: uppercase;">
                 View Listing
               </button>
            </div>
          </div>
        `;

        infoWindow.setContent(contentString);
        infoWindow.open(map, marker);

        (window as any).google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
          document.getElementById(`view-listing-${venue.id}`)?.addEventListener('click', () => {
            navigate(`/venues/${venue.id}`);
          });
        });
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

      // Pan to user if markers just updated
      map.panTo({ lat: coords.latitude, lng: coords.longitude });
    }
  }, [map, venues, coords, status]);

  const handleGetDirections = (venue: Venue) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${venue.location.lat},${venue.location.lng}`, '_blank');
  };

  return (
    <div className="h-full relative bg-slate-900">
      <div ref={mapRef} className={`w-full h-full ${status !== 'ready' ? 'hidden' : ''}`} />

      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-20">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-white font-league text-xl uppercase tracking-widest text-center px-6">Loading OlyBuzz Hub...</p>
        </div>
      )}

      {status === 'ready' && !coords && (
        <button
          onClick={() => requestLocation()}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 bg-primary text-black font-black px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl hover:scale-105 transition-all border-2 border-black active:scale-95 animate-in slide-in-from-bottom duration-500 uppercase tracking-wider font-league italic"
        >
          <Navigation className="w-5 h-5 fill-black" />
          Find My Vibe
        </button>
      )}

      {status === 'ready' && geoLoading && isRequested && !coords && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 bg-black/80 text-primary border-2 border-primary/50 px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl backdrop-blur-md">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-black text-xs uppercase tracking-widest font-league italic">Locating...</span>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-6 text-center z-20">
          {GOOGLE_MAPS_API_KEY ? (
            <>
              <div className="w-full h-64 bg-slate-800 rounded-2xl mb-6 overflow-hidden border border-white/5 relative">
                <iframe
                  title="Google Maps Static View"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=Olympia,WA`}
                  allowFullScreen
                />
                <div className="absolute inset-0 bg-slate-900/40 pointer-events-none flex items-center justify-center">
                  <p className="text-primary font-league uppercase tracking-widest text-lg bg-black/60 px-4 py-2 rounded-lg text-center">Interactive Map Restricted</p>
                </div>
              </div>
              <h3 className="text-2xl font-black text-white font-league uppercase mb-2">Maps Key restricted</h3>
              <p className="text-slate-400 mb-6 max-w-xs mx-auto">The interactive vibe map requires a dedicated Google Maps API key with JS API enabled.</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                <MapPin className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-white font-league uppercase mb-2">Configuration Required</h3>
              <p className="text-slate-400 mb-6 max-w-xs mx-auto">
                Google Maps API key is missing. Please set <code className="text-primary">VITE_GOOGLE_MAPS_API_KEY</code> in your environment.
              </p>
            </>
          )}
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-black font-black px-8 py-3 rounded-xl uppercase font-league tracking-widest hover:scale-105 transition-transform"
          >
            Retry Connection
          </button>
        </div>
      )}

      {geoError && (
        <div className="absolute top-4 left-4 right-4 bg-red-900/90 text-white p-3 rounded-xl flex items-center gap-3 z-30 shadow-lg backdrop-blur-md border border-red-500/30">
          <MapPin className="w-5 h-5 shrink-0 text-white" />
          <p className="text-[10px] font-black uppercase tracking-widest font-league">Location access denied. Map precision limited.</p>
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
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1e293b" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#475569" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#020617" }] },
];

export default MapScreen;
