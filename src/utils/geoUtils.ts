/**
 * Haversine formula to calculate the distance between two points on the Earth.
 * Returns distance in meters.
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
};

/**
 * Converts meters to miles.
 */
export const metersToMiles = (meters: number): number => {
    return meters * 0.000621371;
};

/**
 * Estimates walking time in minutes based on distance in meters.
 * Average walking speed: 1.4 m/s (approx 3.1 mph)
 */
export const estimateWalkTime = (meters: number): number => {
    return Math.ceil(meters / (1.4 * 60));
};

export type OlyZone = 'Downtown' | 'Market/Port' | 'Hill/Capitol' | 'Unknown';

/**
 * Identifies the zone based on coordinates.
 */
export const getZone = (lat: number, lng: number): OlyZone => {
    // Market/Port is generally North of 4th Ave and West of East Bay Dr
    if (lat > 47.048) return 'Market/Port';

    // Hill/Capitol is generally South of 5th Ave
    if (lat < 47.040) return 'Hill/Capitol';

    // Core Downtown
    return 'Downtown';
};

/**
 * Checks if traveling between two points constitutes a "Zone Cross"
 */
export const isZoneCrossed = (lat1: number, lng1: number, lat2: number, lng2: number): boolean => {
    const zone1 = getZone(lat1, lng1);
    const zone2 = getZone(lat2, lng2);
    return zone1 !== zone2 && zone1 !== 'Unknown' && zone2 !== 'Unknown';
};
