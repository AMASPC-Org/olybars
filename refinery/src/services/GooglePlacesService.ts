import 'dotenv/config';

export class GooglePlacesService {
    private apiKey: string;
    private baseUrl = 'https://places.googleapis.com/v1';

    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY!;
        if (!this.apiKey) {
            throw new Error('❌ Missing GEMINI_API_KEY for Google Places Service');
        }
    }

    async findPlaceId(query: string): Promise<string | null> {
        const url = `${this.baseUrl}/places:searchText`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': this.apiKey,
                'X-Goog-FieldMask': 'places.id'
            },
            body: JSON.stringify({ textQuery: query })
        });

        const data: any = await response.json();
        if (data.places && data.places.length > 0) {
            return data.places[0].id;
        }
        return null;
    }

    async getPlaceDetails(placeId: string) {
        const url = `${this.baseUrl}/places/${placeId}`;

        // REQUESTING ATMOSPHERE DATA FIELDS (The "Surveyor" Upgrade)
        const fieldMask = [
            'displayName',
            'formattedAddress',
            'location',
            'currentOpeningHours',
            'rating',
            'userRatingCount',
            'priceLevel',
            'businessStatus',      // Checks if permanently closed
            'websiteUri',
            'nationalPhoneNumber',
            // ATMOSPHERE FLAGS
            'outdoorSeating',
            'liveMusic',
            'servesCocktails',
            'servesBeer',
            'servesBreakfast',
            'goodForWatchingSports',
            'allowsDogs',
            'paymentOptions'       // e.g. Cash Only
        ].join(',');

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': this.apiKey,
                'X-Goog-FieldMask': fieldMask
            }
        });

        return await response.json();
    }
}
