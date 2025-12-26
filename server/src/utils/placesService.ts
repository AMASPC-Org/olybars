import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

/**
 * Robust Environment Loading for Google Maps Service
 * Ensures keys are available in local, development, and production containers.
 */
dotenv.config();

const loadEnvFile = (filename: string) => {
    const envPath = path.resolve(process.cwd(), filename);
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath, override: true });
    }
};

loadEnvFile('.env.local');
loadEnvFile('.env.development');
loadEnvFile('functions/.env');

// Prioritize restricted backend-only key
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_BACKEND_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY;

export interface PlaceSearchResult {
    place_id: string;
    name: string;
    formatted_address: string;
}

export interface PlaceDetails {
    place_id: string;
    name: string;
    formatted_address: string;
    formatted_phone_number?: string;
    website?: string;
    url?: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        }
    };
    opening_hours?: {
        weekday_text: string[];
        open_now: boolean;
    };
    photos?: {
        photo_reference: string;
        height: number;
        width: number;
        html_attributions: string[];
    }[];
}

/**
 * Searches for a place using name and optional address.
 */
export async function searchPlace(venueName: string, address?: string): Promise<PlaceSearchResult | null> {
    if (!GOOGLE_MAPS_API_KEY) {
        console.error('[PLACES_ERROR] Google Maps API Key is missing.');
        return null;
    }

    try {
        const query = address ? `${venueName}, ${address}` : venueName;
        const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address&key=${GOOGLE_MAPS_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.candidates && data.candidates.length > 0) {
            return data.candidates[0];
        } else {
            console.warn(`[PLACES_WARNING] Place search failed for ${query}: ${data.status}`);
            if (data.error_message) console.warn(`[PLACES_ERROR_DETAIL] ${data.error_message}`);
            return null;
        }
    } catch (error) {
        console.error(`[PLACES_ERROR] Error searching place ${venueName}:`, error);
        return null;
    }
}

/**
 * Retrieves detailed information for a specific place_id.
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    if (!GOOGLE_MAPS_API_KEY) {
        console.error('[PLACES_ERROR] Google Maps API Key is missing.');
        return null;
    }

    try {
        const fields = 'place_id,name,formatted_address,formatted_phone_number,website,opening_hours,geometry,url,photos';
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_MAPS_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.result) {
            return data.result;
        } else {
            console.warn(`[PLACES_WARNING] Place details failed for ${placeId}: ${data.status}`);
            return null;
        }
    } catch (error) {
        console.error(`[PLACES_ERROR] Error fetching place details for ${placeId}:`, error);
        return null;
    }
}
