import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_BACKEND_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

export interface GeocodeResult {
    lat: number;
    lng: number;
    formattedAddress?: string;
}

/**
 * Converts a physical address to Latitude and Longitude using Google Maps Geocoding API.
 * @param address The string address to geocode.
 * @returns {Promise<GeocodeResult | null>}
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
    if (!GOOGLE_MAPS_API_KEY) {
        console.error('[GEOCODE_ERROR] Google Maps API Key is missing.');
        return null;
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            return {
                lat: location.lat,
                lng: location.lng,
                formattedAddress: data.results[0].formatted_address
            };
        } else {
            console.warn(`[GEOCODE_WARNING] Geocoding failed for ${address}: ${data.status}`);
            return null;
        }
    } catch (error) {
        console.error(`[GEOCODE_ERROR] Error geocoding address ${address}:`, error);
        return null;
    }
}
