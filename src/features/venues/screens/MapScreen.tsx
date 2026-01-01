import React, { useEffect, useRef, useState } from 'react';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { Venue } from '../../../types';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Loader2, Navigation, MapPin, ExternalLink, Search } from 'lucide-react';
import { PlaceAutocomplete } from '../../../components/ui/PlaceAutocomplete';
import { useGoogleMapsScript } from '../../../hooks/useGoogleMapsScript';

// Triple-slash directive for Google Maps types (if not installed)
// <reference types="@types/google.maps" />

interface ContextType {
  venues: Venue[];
}

const MapScreen = () => {
  const navigate = useNavigate();
  const { venues } = useOutletContext<ContextType>();
  const { coords, error: geoError, loading: geoLoading, requestLocation, isRequested } = useGeolocation({ shouldPrompt: false });
  const mapRef = useRef<HTMLDivElement>(null);
  const infoWindowRef = useRef<any>(null); // Singleton InfoWindow ref
  const markersRef = useRef<any[]>([]); // Track active markers
  const { status, retry, apiKey } = useGoogleMapsScript();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const pulseIntervalRef = useRef<any>(null);

  const initMap = () => {
    if (!mapRef.current) return;
    try {
      const defaultCenter = { lat: 47.0425, lng: -122.9007 }; // Olympia, WA
      const initialMap = new (window as any).google.maps.Map(mapRef.current!, {
        center: coords ? { lat: coords.latitude, lng: coords.longitude } : defaultCenter,
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: true,
        mapId: '6b4fa3a2419c825a', // Required for Advanced Markers
      });
      setMap(initialMap);
    } catch (e: any) {
      console.error('[MAP_ERROR] Failed to init map:', e);
      setInitError(e?.message || 'Unknown Init Error');
    }
  };

  useEffect(() => {
    if (status === 'ready' && mapRef.current && !map) {
      initMap();
    }
  }, [status, map]);

  // ... (render content)

  useEffect(() => {
    if (!map || !venues || status !== 'ready') return;

    // 1. Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    venues.forEach(venue => {
      if (!venue.location?.lat || !venue.location?.lng) return;
      if (venue.isActive === false) return;
      // if (venue.physicalRoom === false) return; // Cleaned up non-existent field

      const isLeagueAnchor = venue.tier_config?.is_league_eligible;
      const isBuzzing = venue.status === 'buzzing';

      const BEER_MUG_PATH = "M4,3h12v15c0,2.2-1.8,4-4,4H8c-2.2,0-4-1.8-4-4V3z M16,6h2c1.7,0,3,1.3,3,3v4c0,1.7-1.3,3-3,3h-2";

      const showBeerMug = venue.establishmentType === 'Bar Only' ||
        venue.establishmentType === 'Bar & Restaurant' ||
        (!venue.establishmentType && isLeagueAnchor);

      // Use google.maps.marker.AdvancedMarkerElement to avoid deprecation and fix visibility
      const marker = new (window as any).google.maps.marker.AdvancedMarkerElement({
        position: { lat: venue.location.lat, lng: venue.location.lng },
        map: map,
        title: venue.name,
        content: (() => {
          const div = document.createElement('div');
          div.className = "custom-marker";
          const iconColor = isLeagueAnchor ? "#fbbf24" : "#64748b";

          // Badge Logic for Clock-Ins
          const badgeHtml = (venue.checkIns && venue.checkIns > 0)
            ? `<div style="position: absolute; top: -8px; right: -8px; background: #ef4444; color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; border: 2px solid #0f172a; box-shadow: 0 2px 4px rgba(0,0,0,0.5); z-index: 10;">${venue.checkIns}</div>`
            : '';

          div.innerHTML = showBeerMug
            ? `<div style="position: relative; color: ${iconColor}; filter: drop-shadow(0 0 4px rgba(0,0,0,0.5));">
                 ${badgeHtml}
                 <svg viewBox="0 0 24 24" width="${isBuzzing ? 32 : 24}" height="${isBuzzing ? 32 : 24}" fill="currentColor" stroke="#000" stroke-width="1.5">
                   <path d="${BEER_MUG_PATH}"></path>
                 </svg>
                 <div style="background: rgba(15, 23, 42, 0.8); color: white; padding: 2px 6px; border-radius: 4px; font-size: ${isLeagueAnchor ? '11px' : '9px'}; font-weight: 900; white-space: nowrap; margin-top: -4px;">${venue.name}</div>
               </div>`
            : `<div style="position: relative; width: 12px; height: 12px; background: ${iconColor}; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.5);">
                ${badgeHtml}
               </div>`;
          return div;
        })()
      });

      markersRef.current.push(marker);

      // LIVE PULSE: Add a background glow for active venues
      const recentActivity = venue.checkIns && venue.checkIns > 0;
      const recentVibeCheck = venue.currentBuzz?.lastUpdated && (Date.now() - venue.currentBuzz.lastUpdated) < 3600000; // Last 1 hour

      if (recentActivity || recentVibeCheck) {
        const pulseMarker = new (window as any).google.maps.marker.AdvancedMarkerElement({
          position: { lat: venue.location.lat, lng: venue.location.lng },
          map: map,
          zIndex: -1,
          content: (() => {
            const div = document.createElement('div');
            const color = recentVibeCheck ? "#fbbf24" : "#60a5fa";
            div.style.width = '40px';
            div.style.height = '40px';
            div.style.borderRadius = '50%';
            div.style.backgroundColor = color;
            div.style.opacity = '0.25';
            div.style.transform = 'translate(-50%, -50%)';
            return div;
          })()
        });
        markersRef.current.push(pulseMarker);

        // BEACON ANIMATION (Radar Pulse)
        let radius = 20;
        let opacity = 0.25;
        const beaconCircle = new (window as any).google.maps.Circle({
          strokeWeight: 0,
          fillColor: recentVibeCheck ? "#fbbf24" : "#60a5fa",
          fillOpacity: opacity,
          map: map,
          center: { lat: venue.location.lat, lng: venue.location.lng },
          radius: radius,
          clickable: false,
          zIndex: -2
        });

        markersRef.current.push(beaconCircle);

        // Create animation loop for this specific beacon
        const animateBeacon = () => {
          radius += 1.5;
          opacity -= 0.008;
          if (radius > 150) {
            radius = 20;
            opacity = 0.25;
          }
          beaconCircle.setRadius(radius);
          beaconCircle.setOptions({ fillOpacity: Math.max(0, opacity) });
        };

        const intervalIdx = setInterval(animateBeacon, 50);
        markersRef.current.push({ setMap: () => clearInterval(intervalIdx) }); // Hack to clear interval on cleanup
      }

      // Singleton InfoWindow pattern
      if (!infoWindowRef.current) {
        infoWindowRef.current = new (window as any).google.maps.InfoWindow();
      }
      const infoWindow = infoWindowRef.current;

      marker.addListener('click', () => {
        // Close any open info window first (though singleton usage handles this implicitly by moving content)
        infoWindow.close();

        const tierTag = isLeagueAnchor ? '[LEAGUE READY]' : '[SOCIAL/DINING]';
        const contentString = `
          <div style="padding: 12px; color: #0f172a; max-width: 200px; font-family: 'Roboto Condensed', sans-serif;">
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
              <span style="background: ${isLeagueAnchor ? '#fbbf24' : '#e2e8f0'}; color: #000; font-size: 8px; font-weight: 900; padding: 2px 4px; border-radius: 4px;">
                ${(venue as any).establishmentType?.toUpperCase() || 'BAR'}
              </span>
              <span style="color: ${isLeagueAnchor ? '#1e293b' : '#64748b'}; font-size: 8px; font-weight: bold;">
                ${tierTag}
              </span>
            </div>
            <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 900; font-family: 'Oswald', sans-serif; text-transform: uppercase;">${venue.name}</h3>
            
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 10px; font-weight: bold; color: #cbd5e1;">
              <div style="display: flex; align-items: center; gap: 3px;">
                <span>👥</span>
                <span>${venue.checkIns || 0} Clocked In</span>
              </div>
              ${isBuzzing ? '<div style="display: flex; align-items: center; gap: 3px; color: #fbbf24;"><span>🔥</span><span>Buzzing</span></div>' : ''}
              ${(venue.status === 'chill' || !venue.status) ? '<div style="display: flex; align-items: center; gap: 3px; color: #60a5fa;"><span>🧊</span><span>Chill</span></div>' : ''}
            </div>

            <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.3; font-style: italic;">"${venue.vibe}"</p>
            ${venue.attributes?.minors_allowed ? '<p style="margin: 4px 0 0 0; font-size: 10px; color: #059669; font-weight: bold;">✓ Minors Allowed</p>' : ''}
            <div style="margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
               <button id="view-listing-${venue.id}" style="background: #0f172a; color: #fbbf24; border: none; padding: 8px; border-radius: 6px; font-size: 11px; font-weight: 900; cursor: pointer; text-transform: uppercase;">
                 View Listing
               </button>
               <button id="get-directions-${venue.id}" style="background: #e2e8f0; color: #0f172a; border: none; padding: 8px; border-radius: 6px; font-size: 11px; font-weight: 900; cursor: pointer; text-transform: uppercase;">
                 Directions
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
          document.getElementById(`get-directions-${venue.id}`)?.addEventListener('click', () => {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${venue.location?.lat},${venue.location?.lng}`, '_blank');
          });
        });
      });
    });

    if (coords) {
      new (window as any).google.maps.marker.AdvancedMarkerElement({
        position: { lat: coords.latitude, lng: coords.longitude },
        map: map,
        title: "You Are Here",
        content: (() => {
          const div = document.createElement('div');
          div.innerHTML = `<div style="width: 20px; height: 20px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(59,130,246,0.5);"></div>`;
          return div;
        })()
      });

      // Pan to user if markers just updated
      map.panTo({ lat: coords.latitude, lng: coords.longitude });
    }
  }, [map, venues, coords, status]);

  const handleDirections = (venue: Venue) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${venue.location?.lat},${venue.location?.lng}`, '_blank');
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (!map || !place.geometry?.location) return;

    map.setCenter(place.geometry.location);
    map.setZoom(16);

    // Add a temporary marker for the searched place if it's not a venue
    new (window as any).google.maps.marker.AdvancedMarkerElement({
      position: place.geometry.location,
      map: map,
      content: (() => {
        const div = document.createElement('div');
        div.innerHTML = `<div style="font-size: 24px;">📍</div>`;
        return div;
      })()
    });
  };

  return (
    <div className="h-full relative bg-slate-900 overflow-hidden">
      {/* Search Header */}
      <div className="absolute top-6 left-6 right-6 z-30 animate-in fade-in slide-in-from-top duration-700">
        <PlaceAutocomplete
          onPlaceSelect={handlePlaceSelect}
          placeholder="Where we drinking tonight?"
          className="max-w-md mx-auto"
        />
      </div>

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
          {apiKey ? (
            <>
              <div className="w-full h-64 bg-slate-800 rounded-2xl mb-6 overflow-hidden border border-white/5 relative">
                <iframe
                  title="Google Maps Static View"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=Olympia,WA`}
                  allowFullScreen
                />
                <div className="absolute inset-0 bg-slate-900/40 pointer-events-none flex items-center justify-center">
                  <p className="text-primary font-league uppercase tracking-widest text-lg bg-black/60 px-4 py-2 rounded-lg text-center">Interactive Map Restricted</p>
                </div>
              </div>
              <h3 className="text-2xl font-black text-white font-league uppercase mb-2">Maps Service Degraded</h3>
              <p className="text-slate-400 mb-6 max-w-xs mx-auto">The interactive JS API failed to initialize. Displaying static fallback.</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                <MapPin className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-white font-league uppercase mb-2">Configuration Required</h3>
              <p className="text-slate-400 mb-6 max-w-xs mx-auto">
                Could not retrieve Maps API key from backend. The system may be offline or restricted.
              </p>
            </>
          )}
          <button
            onClick={() => retry()}
            className="bg-primary text-black font-black px-8 py-3 rounded-xl uppercase font-league tracking-widest hover:scale-105 transition-transform"
          >
            Attempt Reconnect
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
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.attraction", stylers: [{ visibility: "off" }] },
  { featureType: "poi.medical", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "labels.text", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1e293b" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#475569" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#020617" }] },
];

export default MapScreen;
