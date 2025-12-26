# OlyBars Maps Integrity & Cost Governance

To ensure long-term stability and cost efficiency of the Google Maps integration, the following rules MUST be followed.

## 1. Field Masking (Mandatory)
Never request * or a full category of data if not needed.

### Frontend (Autocomplete)
- Use ONLY: \place_id\, \
ame\, \ormatted_address\, \geometry\.
- **Reason**: This falls under the \"Basic Data\" category which is significantly cheaper than \"Atmosphere\" or \"Contact\" data in the Autocomplete context.

### Backend (Place Details)
- Request only the specific fields required for venue syncing.
- Currently sanctioned: \place_id\, \
ame\, \ormatted_address\, \ormatted_phone_number\, \website\, \opening_hours\, \geometry\, \url\, \photos\.
- > [!WARNING]
  > Retaining \photos\ triggers the **Atmosphere** SKU. Avoid adding \ating\ or \eviews\ unless a specific feature requires them, as they clutter the data model and ensure we stay in the highest billing tier.

## 2. Library Load Policy
- Only load required libraries in the Google Maps script.
- **FORBIDDEN**: Do not load \isualization\ unless a heatmap feature is explicitly approved.
- **ALLOWED**: \places\.

## 3. Map Usage Guidelines
- Prefer **Static Maps** for low-interaction views (e.g., footer maps, small previews).
- Use **Dynamic (JS) Maps** only for interactive features like the main \/map\ hub.
- Always use the \useGoogleMapsScript\ hook to ensure the \"Unified Key Strategy\" is respected.

## 4. Derived Environments
- Never hardcode API Keys.
- Keys must be retrieved via the backend proxy (\API_ENDPOINTS.CONFIG.MAPS_KEY\) to ensure restriction policies are applied correctly across DEV and PROD.
