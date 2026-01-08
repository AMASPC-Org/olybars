import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Venue } from '../../../types';
import { useGoogleMapsScript } from '../../../hooks/useGoogleMapsScript';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { Loader2, MapPin } from 'lucide-react';
import { useDiscovery } from '../contexts/DiscoveryContext';

interface VenueMapProps {
    venues: Venue[];
    center?: { lat: number; lng: number };
    zoom?: number;
    height?: string;
    className?: string;
}

const REGION_TARGETS: Record<string, { lat: number; lng: number; zoom: number }> = {
    westside: { lat: 47.0435, lng: -122.9310, zoom: 14 },
    downtown: { lat: 47.0425, lng: -122.9007, zoom: 15 },
    eastside: { lat: 47.0425, lng: -122.8680, zoom: 14 }
};

export const VenueMap: React.FC<VenueMapProps> = ({
    venues,
    center,
    zoom = 14,
    height = '100%',
    className = ''
}) => {
    const navigate = useNavigate();
    const mapRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<any[]>([]);
    const infoWindowRef = useRef<any>(null);
    const { status, apiKey } = useGoogleMapsScript();
    const { coords } = useGeolocation({ shouldPrompt: false });
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const { mapRegion } = useDiscovery();

    const initMap = () => {
        if (!mapRef.current || !window.google) return;

        // Use region target or geolocation or default Oly
        const target = REGION_TARGETS[mapRegion] || REGION_TARGETS.downtown;
        const initialMap = new google.maps.Map(mapRef.current, {
            center: center || target,
            zoom: zoom || target.zoom,
            disableDefaultUI: true,
            zoomControl: true,
            mapId: '6b4fa3a2419c825a',
            styles: darkMapStyle
        });
        setMap(initialMap);
    };

    useEffect(() => {
        if (status === 'ready' && !map) {
            initMap();
        }
    }, [status, map]);

    // Region Navigation Logic
    useEffect(() => {
        if (!map || !window.google) return;
        const target = REGION_TARGETS[mapRegion];
        if (target) {
            map.panTo({ lat: target.lat, lng: target.lng });
            map.setZoom(target.zoom);
        }
    }, [map, mapRegion]);

    useEffect(() => {
        if (!map || !venues || !window.google) return;

        // Clear old markers
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];

        const BEER_MUG_PATH = "M4,3h12v15c0,2.2-1.8,4-4,4H8c-2.2,0-4-1.8-4-4V3z M16,6h2c1.7,0,3,1.3,3,3v4c0,1.7-1.3,3-3,3h-2";

        venues.forEach(venue => {
            if (!venue.location?.lat || !venue.location?.lng) return;
            if (venue.isActive === false) return;

            const isLeagueAnchor = venue.tier_config?.is_league_eligible;
            const isBuzzing = venue.status === 'buzzing';

            const showBeerMug = venue.establishmentType === 'Bar Only' ||
                venue.establishmentType === 'Bar & Restaurant' ||
                (!venue.establishmentType && isLeagueAnchor);

            const marker = new google.maps.marker.AdvancedMarkerElement({
                position: { lat: venue.location.lat, lng: venue.location.lng },
                map: map,
                title: venue.name,
                content: (() => {
                    const div = document.createElement('div');
                    div.className = "custom-marker";
                    const iconColor = isLeagueAnchor ? "#fbbf24" : "#64748b";
                    const badgeHtml = (venue.clockIns && venue.clockIns > 0)
                        ? `<div style="position: absolute; top: -8px; right: -8px; background: #ef4444; color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; border: 2px solid #0f172a; box-shadow: 0 2px 4px rgba(0,0,0,0.5); z-index: 10;">${venue.clockIns}</div>`
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

            marker.addListener('click', () => {
                navigate(`/venues/${venue.id}`);
            });

            markersRef.current.push(marker);

            // Pulse logic logic
            const recentActivity = venue.clockIns && venue.clockIns > 0;
            const recentVibeCheck = venue.currentBuzz?.lastUpdated && (Date.now() - venue.currentBuzz.lastUpdated) < 3600000;

            if (recentActivity || recentVibeCheck) {
                const beaconCircle = new google.maps.Circle({
                    strokeWeight: 0,
                    fillColor: recentVibeCheck ? "#fbbf24" : "#60a5fa",
                    fillOpacity: 0.2,
                    map: map,
                    center: { lat: venue.location.lat, lng: venue.location.lng },
                    radius: 50,
                    clickable: false,
                    zIndex: -2
                });
                markersRef.current.push(beaconCircle);
            }
        });

    }, [map, venues, status]);

    return (
        <div className={`relative w-full overflow-hidden ${className}`} style={{ height }}>
            <div ref={mapRef} className="w-full h-full" />
            {status === 'loading' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                    <p className="text-white font-league text-sm uppercase tracking-widest text-center px-6 italic">Synchronizing Buzz Hub...</p>
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
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#020617" }] },
];
